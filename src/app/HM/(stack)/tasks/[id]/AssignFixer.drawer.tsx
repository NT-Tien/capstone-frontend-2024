import headstaff_qk from "@/features/head-maintenance/qk"
import HeadStaff_Task_Update from "@/features/head-maintenance/api/task/update.api"
import HeadStaff_Users_AllStaff from "@/features/head-maintenance/api/users/all.api"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { UserDto } from "@/lib/domain/User/User.dto"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import useModalControls from "@/lib/hooks/useModalControls"
import { CheckCard } from "@ant-design/pro-components"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Button, Card, DatePicker, Drawer, Empty, Form, Radio, Tag } from "antd"
import dayjs, { Dayjs } from "dayjs"
import { forwardRef, useImperativeHandle, useMemo, useState } from "react"

type FieldType = {
   name: string
   fixer?: string
   fixerDate?: Dayjs
   priority: boolean
   operator: number
   totalTime: number
   request: string
   issueIDs: string[]
}

type SortedUserDto = Omit<UserDto, "tasks"> & {
   sorted_tasks: {
      priority: TaskDto[]
      normal: TaskDto[]
   }
   totalTime: number
   hasPriority: boolean
}

export type AssignFixerDrawerRefType = {
   handleOpen: (
      taskId: string,
      initialValues: {
         priority?: boolean
         fixerDate?: Dayjs
         fixer?: UserDto
      },
   ) => void
}

type Props = {
   refetchFn?: () => void
   afterFinish?: () => void
}

const AssignFixerDrawer = forwardRef<AssignFixerDrawerRefType, Props>(function Component({ ...props }, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (
         taskId: string,
         initialValues: {
            priority?: boolean
            fixerDate?: Dayjs
            fixer?: UserDto
         },
      ) => {
         setTaskId(taskId)
         setPriority(initialValues.priority ?? false)
         setFixerDate(initialValues.fixerDate?.isValid() ? initialValues.fixerDate : undefined)
         setFixer(initialValues.fixer)
      },
      onClose: () => {
         setTaskId(undefined)
      },
   })
   const { message } = App.useApp()

   const [fixer, setFixer] = useState<UserDto | undefined>(undefined)
   const [fixerDate, setFixerDate] = useState<Dayjs | undefined>(undefined)
   const [priority, setPriority] = useState<boolean>(false)
   const [taskId, setTaskId] = useState<string | undefined>()

   const api_user = useQuery({
      queryKey: headstaff_qk.user.all(),
      queryFn: () => HeadStaff_Users_AllStaff({}),
      enabled: !!fixerDate,
   })

   const sorted = useMemo(() => {
      if (!api_user.isSuccess || !fixerDate) return
      const selectedFixDate = dayjs(fixerDate).add(7, "hours")

      if (!selectedFixDate.isValid()) return

      const response: SortedUserDto[] = []

      for (const row of api_user.data) {
         const { tasks, ...user } = row
         let total: number = 0,
            hasPriority: boolean = false

         const rowData = tasks.reduce(
            (acc, task) => {
               if (task.status !== TaskStatus.ASSIGNED) return acc
               if (dayjs(task.fixerDate).add(7, "hours").isSame(selectedFixDate, "date")) {
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
   }, [api_user.data, api_user.isSuccess, fixerDate])

   const mutate_update = useMutation({
      mutationFn: HeadStaff_Task_Update,
      onMutate: async () => {
         message.destroy("loading")
         message.open({
            type: "loading",
            content: "Vui lòng chờ đợi...",
            key: "loading",
         })
      },
      onSuccess: async () => {
         message.success("Cập nhật tác vụ thành công")
      },
      onError: async (error) => {
         message.error("Cập nhật tác vụ thất bại: " + error.message)
      },
      onSettled: async () => {
         message.destroy("loading")
      },
   })

   function handleSubmit() {
      if (!taskId) return
      if (fixer === undefined || fixerDate === undefined) return

      mutate_update.mutate(
         {
            id: taskId,
            payload: {
               fixer: fixer.id,
               fixerDate: fixerDate.toISOString(),
               priority,
               status: TaskStatus.ASSIGNED,
            },
         },
         {
            onSuccess: () => {
               props.refetchFn?.()
               handleClose()
               props.afterFinish?.()
            },
         },
      )
   }

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <>
         <Drawer
            open={open}
            onClose={handleClose}
            title="Cập nhật tác vụ"
            placement="bottom"
            height="100%"
            className="pb-24"
            classNames={{
               body: "py-0 px-0",
            }}
         >
            <Form>
               <main className="std-layout">
                  <section className="std-layout-outer sticky top-0 z-50 bg-white px-layout shadow-lg">
                     <Form.Item<FieldType> rules={[{ required: true }]} label="Ngày sửa">
                        <DatePicker
                           size="large"
                           className="w-full"
                           placeholder="Chọn ngày sửa chữa cho tác vụ"
                           disabledDate={(current) => current && current < dayjs().startOf("day")}
                           onChange={(date) => {
                              setFixerDate(date)
                              setFixer(undefined)
                           }}
                           value={fixerDate}
                        />
                     </Form.Item>
                     <Form.Item<FieldType> label="Mức độ ưu tiên">
                        <Radio.Group
                           buttonStyle="solid"
                           size="large"
                           className="flex"
                           value={priority}
                           onChange={(e) => {
                              setFixer(undefined)
                              setPriority(e.target.value)
                           }}
                        >
                           <Radio.Button value={false} className="w-full text-center">
                              Thường
                           </Radio.Button>
                           <Radio.Button value={true} className="w-full text-center">
                              Ưu tiên
                           </Radio.Button>
                        </Radio.Group>
                     </Form.Item>
                  </section>

                  <section className="mt-4">
                     <h3 className="mb-2 text-base font-medium">Chọn nhân viên sửa chữa</h3>
                     {!!sorted === false ? (
                        <Card>
                           <Empty description="Vui lòng chọn ngày sửa chữa trước khi chọn nhân viên sửa chữa" />
                        </Card>
                     ) : (
                        <div className="grid grid-cols-1 gap-2">
                           {api_user.isSuccess &&
                              sorted
                                 ?.sort((a, b) => {
                                    return a.totalTime - b.totalTime
                                 })
                                 .map((e) => (
                                    <>
                                       <CheckCard
                                          key={e.id}
                                          title={
                                             <div className="flex items-center gap-2">
                                                <Radio checked={fixer?.username === e.username} />
                                                <span>{e.username}</span>
                                             </div>
                                          }
                                          size="small"
                                          description={"Tổng thời gian làm việc: " + e.totalTime + ` phút`}
                                          onClick={() => {
                                             const { hasPriority, sorted_tasks, ...rest } = e
                                             setFixer({
                                                ...rest,
                                                tasks: [],
                                             })
                                          }}
                                          checked={e.id === fixer?.id}
                                          className="m-0 w-full"
                                          extra={
                                             e.hasPriority &&
                                             priority && <Tag color="red-inverse">Đã có công việc ưu tiên</Tag>
                                          }
                                          disabled={e.hasPriority && priority}
                                       ></CheckCard>
                                    </>
                                 ))}
                        </div>
                     )}
                  </section>
               </main>

               <section className="fixed bottom-0 left-0 flex w-full justify-between gap-3 bg-white p-layout shadow-fb">
                  <Button type="primary" size="large" className="w-full" onClick={handleSubmit} disabled={!fixer}>
                     Cập nhật tác vụ
                  </Button>
               </section>
            </Form>
         </Drawer>
      </>
   )
})

export default AssignFixerDrawer
