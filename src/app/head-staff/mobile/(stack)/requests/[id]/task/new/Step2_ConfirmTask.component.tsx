"use client"

import { UserDto } from "@/common/dto/User.dto"
import { TaskDto } from "@/common/dto/Task.dto"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import React, { Dispatch, memo, SetStateAction, useCallback, useEffect, useMemo, useState } from "react"
import dayjs, { Dayjs } from "dayjs"
import { App, Button, Checkbox, Drawer, Input, Result, Spin, Tag } from "antd"
import { useRouter } from "next/navigation"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Users_AllStaff from "@/app/head-staff/_api/users/all.api"
import HeadStaff_Task_Create from "@/app/head-staff/_api/task/create.api"
import HeadStaff_Task_UpdateAssignFixer from "@/app/head-staff/_api/task/update-assignFixer.api"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { ArrowLeftOutlined, EyeOutlined, LeftOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons"
import { CheckCard } from "@ant-design/pro-card"
import { SelectedIssueType } from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/page"
import { usePageContext } from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/page.context"

type SortedUserDto = Omit<UserDto, "tasks"> & {
   sorted_tasks: {
      priority: TaskDto[]
      normal: TaskDto[]
   }
   totalTime: number
   hasPriority: boolean
}

type Step2_Props = {
   api: UseQueryResult<FixRequestDto, Error>
   requestId: string | undefined
   requestStatus: FixRequestStatus | undefined
   setSelectedFixer: Dispatch<SetStateAction<UserDto | undefined>>
   selectedFixer: UserDto | undefined
   selectedFixDate: Dayjs | undefined
   selectedIssues: SelectedIssueType
   selectedTaskName: string | undefined
   selectedPriority: boolean
   resetAll: () => void
}

const Step2_ConfirmTask = memo(function Component(props: Step2_Props) {
   const { message } = App.useApp()
   const router = useRouter()

   const { setStep, setNextBtnProps, setPrevBtnProps } = usePageContext()

   const [searchTerm, setSearchTerm] = useState("")
   const [successTaskId, setSuccessTaskId] = useState<undefined | string>()
   const [isFinalTask, setIsFinalTask] = useState(false)
   const [isLoading, setIsLoading] = useState(false)

   const api_user = useQuery({
      queryKey: headstaff_qk.user.all(),
      queryFn: () => HeadStaff_Users_AllStaff(),
      enabled: !!props.selectedFixDate,
   })

   const sorted = useMemo(() => {
      if (!api_user.isSuccess) return

      const response: SortedUserDto[] = []

      for (const row of api_user.data) {
         const { tasks, ...user } = row
         let total: number = 0,
            hasPriority: boolean = false

         const rowData = tasks.reduce(
            (acc, task) => {
               if (dayjs(task.fixerDate).add(7, "hours").isSame(dayjs(props.selectedFixDate).add(7, "hours"), "date")) {
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
   }, [api_user.data, api_user.isSuccess, props.selectedFixDate])

   const filtered = useMemo(() => {
      if (!sorted) return
      return sorted.filter((e) => e.username.toLowerCase().includes(searchTerm.toLowerCase()))
   }, [sorted, searchTerm])

   const mutate_createTask = useMutation({
      mutationFn: HeadStaff_Task_Create,
      onMutate: async () => {
         message.destroy("loading")
         message.open({
            type: "loading",
            content: "Vui lòng chờ đợi...",
            key: "loading",
         })
      },
   })
   const mutate_assignFixer = useMutation({
      mutationFn: HeadStaff_Task_UpdateAssignFixer,
      onSuccess: async () => {
         message.success("Tạo tác vụ thành công")
      },
      onError: async () => {
         message.error("Tạo tác vụ thất bại")
      },
      onSettled: async () => {
         message.destroy("loading")
      },
      retry: 3,
   })
   const mutate_updateRequestStatus = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
      retry: 3,
   })

   function handleOpenSuccess(taskId: string) {
      setSuccessTaskId(taskId)
   }

   function handleCloseSuccess() {
      setSuccessTaskId(undefined)
   }

   const handleFinish = useCallback(async () => {
      setIsLoading(true)
      try {
         if (
            !props.selectedTaskName ||
            !props.selectedFixDate ||
            !props.selectedFixer ||
            !props.requestId ||
            !props.requestStatus
         )
            throw new Error()

         const issueIDs = Object.keys(props.selectedIssues)
         const totalTime = issueIDs.reduce((acc, id) => {
            return acc + props.selectedIssues[id].typeError.duration
         }, 0)

         const task = await mutate_createTask.mutateAsync({
            name: props.selectedTaskName,
            fixerDate: props.selectedFixDate.toISOString(),
            priority: props.selectedPriority,
            issueIDs,
            totalTime,
            request: props.requestId,
            operator: 0,
         })

         if (props.requestStatus === FixRequestStatus.PENDING) {
            await mutate_updateRequestStatus.mutateAsync({
               id: props.requestId,
               payload: {
                  status: FixRequestStatus.APPROVED,
                  checker_note: "",
               },
            })
         }

         await mutate_assignFixer.mutateAsync({
            id: task.id,
            payload: {
               fixer: props.selectedFixer.id,
            },
         })

         handleOpenSuccess(task.id)
      } catch (e) {
         message.error("Tạo tác vụ thất bại").then()
      } finally {
         setIsLoading(false)
      }
   }, [
      message,
      mutate_assignFixer,
      mutate_createTask,
      mutate_updateRequestStatus,
      props.requestId,
      props.requestStatus,
      props.selectedFixDate,
      props.selectedFixer,
      props.selectedIssues,
      props.selectedPriority,
      props.selectedTaskName,
   ])

   useEffect(() => {
      setPrevBtnProps({
         children: "Quay lại",
         onClick: () => {
            props.setSelectedFixer(undefined)
            setStep(1)
         },
         icon: <ArrowLeftOutlined />,
      })
      setNextBtnProps({
         onClick: async () => {
            await handleFinish()
         },
         children: "Tạo tác vụ",
         icon: <UploadOutlined />,
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [handleFinish, props.setSelectedFixer, setNextBtnProps, setPrevBtnProps, setStep])

   useEffect(() => {
      if (!props.selectedFixer) {
         setNextBtnProps((prev) => ({
            ...prev,
            disabled: true,
         }))
      } else {
         setNextBtnProps((prev) => ({
            ...prev,
            disabled: false,
         }))
      }
   }, [props.selectedFixer, setNextBtnProps])

   useEffect(() => {
      const remainingTasks = props.api.data?.issues.filter((issue) => issue.task === null).length ?? 0
      const selectedIssuesLength = Object.keys(props.selectedIssues).length
      setIsFinalTask(remainingTasks === selectedIssuesLength)
   }, [props.api.data, props.selectedIssues])

   return (
      <section className="mt-layout flex flex-col gap-2">
         {isLoading && <Spin fullscreen />}
         <Input.Search
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm nhân viên..."
            size="large"
         />
         {searchTerm
            ? api_user.isSuccess &&
              filtered
                 ?.sort((a, b) => {
                    return a.totalTime - b.totalTime
                 })
                 .map((e) => (
                    <CheckCard
                       key={e.id}
                       title={
                          <div className="flex items-center gap-2">
                             <Checkbox checked={props.selectedFixer?.username === e.username} />
                             <span>{e.username}</span>
                          </div>
                       }
                       size="small"
                       description={"Tổng thời gian làm việc: " + e.totalTime + ` phút`}
                       onClick={() => {
                          const { hasPriority, sorted_tasks, ...rest } = e
                          props.setSelectedFixer({
                             ...rest,
                             tasks: [],
                          })
                       }}
                       checked={e.id === props.selectedFixer?.id}
                       className="m-0 w-full"
                       extra={<Tag>Có mặt</Tag>}
                       disabled={e.hasPriority && props.selectedPriority}
                    ></CheckCard>
                 ))
            : api_user.isSuccess &&
              sorted
                 ?.sort((a, b) => {
                    return a.totalTime - b.totalTime
                 })
                 .map((e) => (
                    <CheckCard
                       key={e.id}
                       title={
                          <div className="flex items-center gap-2">
                             <Checkbox checked={props.selectedFixer?.username === e.username} />
                             <span>{e.username}</span>
                          </div>
                       }
                       size="small"
                       description={"Tổng thời gian làm việc: " + e.totalTime + ` phút`}
                       onClick={() => {
                          const { hasPriority, sorted_tasks, ...rest } = e
                          props.setSelectedFixer({
                             ...rest,
                             tasks: [],
                          })
                       }}
                       checked={e.id === props.selectedFixer?.id}
                       className="m-0 w-full"
                       extra={<Tag>Có mặt</Tag>}
                       disabled={e.hasPriority && props.selectedPriority}
                    ></CheckCard>
                 ))}
         <Drawer
            open={!!successTaskId}
            onClose={handleCloseSuccess}
            closeIcon={null}
placement="bottom"
            height="100%"
            classNames={{
               body: "grid place-content-center",
            }}
         >
            <Result
               status="success"
               title="Tạo tác vụ thành công"
               subTitle="Tác vụ của bạn đã được tạo thành công."
               extra={[
                  !isFinalTask ? (
                     <Button
                        key="add"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                           props.resetAll()
                           handleCloseSuccess()
                        }}
                        size="large"
                     >
                        Tạo tác vụ mới
                     </Button>
                  ) : (
                     <Button
                        key="add"
                        type="primary"
                        icon={<LeftOutlined />}
                        onClick={() => {
                           router.push(`/head-staff/mobile/requests/${props.requestId}`)
                        }}
                        size="large"
                     >
                        Quay về
                     </Button>
                  ),
                  <Button
                     key="view"
                     type="primary"
                     icon={<EyeOutlined />}
                     onClick={() => router.push(`/head-staff/mobile/tasks/${successTaskId}`)}
                     size="large"
                  >
                     Xem tác vụ
                  </Button>,
               ]}
            />
         </Drawer>
      </section>
   )
})

export default Step2_ConfirmTask
