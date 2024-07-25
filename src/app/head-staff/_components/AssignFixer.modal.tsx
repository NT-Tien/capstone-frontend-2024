import { ReactNode, useMemo, useState } from "react"
import { App, Input, Modal, Tag } from "antd"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Users_AllStaff from "@/app/head-staff/_api/users/all.api"
import { UserDto } from "@/common/dto/User.dto"
import { TaskDto } from "@/common/dto/Task.dto"
import { CheckCard } from "@ant-design/pro-card"
import HeadStaff_Task_UpdateAssignFixer from "@/app/head-staff/_api/task/update-assignFixer.api"
import dayjs from "dayjs"

type SortedUserDto = Omit<UserDto, "tasks"> & {
   sorted_tasks: {
      priority: TaskDto[]
      normal: TaskDto[]
   }
   totalTime: number
   hasPriority: boolean
}

export default function AssignFixerModal({
   children,
   onSelect,
}: {
   children: (handleOpen: (taskId?: string, selectedDate?: string, isPriority?: boolean) => void) => ReactNode
   onSelect?: (selectedUser: UserDto, handleClose: () => void) => void
}) {
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const [open, setOpen] = useState(false)
   const [taskId, setTaskId] = useState<undefined | string>(undefined)
   const [selectedDate, setSelectedDate] = useState<undefined | string>(undefined)
   const [isPriority, setIsPriority] = useState<undefined | boolean>()
   const [selectedUser, setSelectedUser] = useState<undefined | SortedUserDto>(undefined)
   const [searchTerm, setSearchTerm] = useState("")

   const api = useQuery({
      queryKey: headstaff_qk.user.all(),
      queryFn: () => HeadStaff_Users_AllStaff(),
      enabled: !!selectedDate,
   })

   const mutate_assignFixer = useMutation({
      mutationFn: HeadStaff_Task_UpdateAssignFixer,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "assigning-fixer",
            content: "Assigning Fixer...",
         })
      },
      onError: async () => {
         message.error("Phân công thất bại")
      },
      onSuccess: async () => {
         message.success("Phân công thành công")
         await queryClient.invalidateQueries({
            queryKey: headstaff_qk.task.base(),
         })
      },
      onSettled: () => {
         message.destroy("assigning-fixer")
      },
   })

   const sorted = useMemo(() => {
      if (!api.isSuccess) return

      const response: SortedUserDto[] = []

      for (const row of api.data) {
         const { tasks, ...user } = row
         let total: number = 0,
            hasPriority: boolean = false

         const rowData = tasks.reduce(
            (acc, task) => {
               if (dayjs(task.fixerDate).add(7, "hours").isSame(dayjs(selectedDate), "date")) {
                  total += task.totalTime

                  if (task.priority) {
                     hasPriority = true
                     acc.priority.push(task)
                  } else {
                     acc.normal.push(task)
                  }
               }
               return acc
            },
            {
               priority: [],
               normal: [],
            } as {
               priority: TaskDto[]
               normal: TaskDto[]
            },
         )

         response.push({
            ...user,
            sorted_tasks: rowData,
            totalTime: total,
            hasPriority,
         })
      }

      return response
   }, [api.data, api.isSuccess, selectedDate])

   const filtered = useMemo(() => {
      if (!sorted) return
      return sorted.filter((e) => e.username.toLowerCase().includes(searchTerm.toLowerCase()))
   }, [sorted, searchTerm])

   function handleOpen(taskId?: string, selectedDate?: string, isPriority?: boolean) {
      setOpen(true)
      setTaskId(taskId)
      setSelectedDate(selectedDate)
      setIsPriority(isPriority)
   }

   function handleClose() {
      setOpen(false)
      setTaskId(undefined)
      setSelectedDate(undefined)
      setIsPriority(undefined)
      setSelectedUser(undefined)
      setSearchTerm("")
   }

   function handleFinish() {
      if (!selectedUser) return

      if (onSelect === undefined) {
         if (!taskId) return

         mutate_assignFixer.mutate(
            {
               id: taskId,
               payload: {
                  fixer: selectedUser.id,
               },
            },
            {
               onSuccess: () => {
                  handleClose()
               },
            },
         )
      } else {
         const { hasPriority, sorted_tasks, ...rest } = selectedUser
         onSelect(
            {
               ...rest,
               tasks: [],
            },
            handleClose,
         )
      }
   }

   return (
      <>
         {children(handleOpen)}
         <Modal
            open={open}
            onOk={handleFinish}
            onCancel={handleClose}
            cancelText="Hủy"
            title="Phân công người sửa chữa"
            okText="Xác nhận"
            okButtonProps={{
               disabled: !selectedUser,
            }}
         >
            <section className="flex flex-col gap-2">
               <Input.Search
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm"
               />
               {searchTerm
                  ? api.isSuccess &&
                    filtered
                       ?.sort((a, b) => {
                          return a.totalTime - b.totalTime
                       })
                       .map((e) => (
                          <CheckCard
                             key={e.id}
                             title={e.username}
                             size="small"
                             description={"Tổng thời gian: " + e.totalTime + ` phút`}
                             onClick={() => setSelectedUser(e)}
                             checked={e.id === selectedUser?.id}
                             className="m-0 w-full"
                             extra={<Tag>Available</Tag>}
                             disabled={!e.hasPriority && isPriority}
                          ></CheckCard>
                       ))
                  : api.isSuccess &&
                    sorted
                       ?.sort((a, b) => {
                          return a.totalTime - b.totalTime
                       })
                       .map((e) => (
                          <CheckCard
                             key={e.id}
                             title={e.username}
                             size="small"
                             description={"Tổng thời gian: " + e.totalTime + ` phút`}
                             onClick={() => setSelectedUser(e)}
                             checked={e.id === selectedUser?.id}
                             className="m-0 w-full"
                             extra={<Tag>Có mặt</Tag>}
                             disabled={e.hasPriority && isPriority}
                          ></CheckCard>
                       ))}
            </section>
         </Modal>
      </>
   )
}
