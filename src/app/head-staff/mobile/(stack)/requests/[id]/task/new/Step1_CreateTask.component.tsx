"use client"

import dayjs, { Dayjs } from "dayjs"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import React, { Dispatch, memo, SetStateAction, useCallback, useEffect, useMemo, useState } from "react"
import { App, Button, Card, Checkbox, Drawer, Empty, Form, Radio, Result, Spin, Tag } from "antd"
import { ArrowLeftOutlined, ArrowRightOutlined, EyeOutlined, LeftOutlined, PlusOutlined } from "@ant-design/icons"
import { ProFormDatePicker, ProFormText } from "@ant-design/pro-components"
import { usePageContext } from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/page.context"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Users_AllStaff from "@/app/head-staff/_api/users/all.api"
import { TaskDto } from "@/common/dto/Task.dto"
import { UserDto } from "@/common/dto/User.dto"
import HeadStaff_Task_Create from "@/app/head-staff/_api/task/create.api"
import HeadStaff_Task_UpdateAssignFixer from "@/app/head-staff/_api/task/update-assignFixer.api"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { SelectedIssueType } from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/page"
import { CheckCard } from "@ant-design/pro-card"
import { useRouter } from "next/navigation"
import { TaskStatus } from "@/common/enum/task-status.enum"

type SortedUserDto = Omit<UserDto, "tasks"> & {
   sorted_tasks: {
      priority: TaskDto[]
      normal: TaskDto[]
   }
   totalTime: number
   hasPriority: boolean
}

type FieldType = {
   name: string
   fixDate: Dayjs
   priority: boolean
}

type Step1_Props = {
   api: UseQueryResult<FixRequestDto, Error>
   selectedFixDate: Dayjs | undefined
   setSelectedFixDate: Dispatch<SetStateAction<Dayjs | undefined>>
   selectedPriority: boolean
   setSelectedPriority: Dispatch<SetStateAction<boolean>>
   selectedTaskName: string | undefined
   setSelectedTaskName: Dispatch<SetStateAction<string | undefined>>
   requestId: string | undefined
   requestStatus: FixRequestStatus | undefined
   selectedFixer: UserDto | undefined
   setSelectedFixer: Dispatch<SetStateAction<UserDto | undefined>>
   selectedIssues: SelectedIssueType
   resetAll: () => void
}

const Step1_CreateTask = memo(function Component(props: Step1_Props) {
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()
   const router = useRouter()
   const { setStep, setNextBtnProps, setPrevBtnProps } = usePageContext()

   const api_user = useQuery({
      queryKey: headstaff_qk.user.all(),
      queryFn: () => HeadStaff_Users_AllStaff(),
      enabled: !!props.selectedFixDate,
   })

   const [isLoading, setIsLoading] = useState(false)

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

   const sorted = useMemo(() => {
      if (!api_user.isSuccess) return

      const response: SortedUserDto[] = []

      for (const row of api_user.data) {
         const { tasks, ...user } = row
         let total: number = 0,
            hasPriority: boolean = false

         const rowData = tasks.reduce(
            (acc, task) => {
               if (task.status !== TaskStatus.ASSIGNED) return acc
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

   const handleFinish = useCallback(
      async function handleFinish() {
         try {
            if (!props.selectedTaskName) {
               form.setFields([
                  {
                     name: "name",
                     errors: ["Vui lòng điền tên tác vụ"],
                  },
               ])
            }

            if (!props.selectedFixDate) {
               form.setFields([
                  {
                     name: "fixDate",
                     errors: ["Vui lòng chọn ngày sửa chữa"],
                  },
               ])
            }

            if (!props.selectedTaskName || !props.selectedFixDate) return

            setIsLoading(true)
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

            // if (props.requestStatus === FixRequestStatus.CHECKED) {
            //    await mutate_updateRequestStatus.mutateAsync({
            //       id: props.requestId,
            //       payload: {
            //          status: FixRequestStatus.APPROVED,
            //          checker_note: "",
            //       },
            //    })
            // }

            await mutate_assignFixer.mutateAsync({
               id: task.id,
               payload: {
                  fixer: props.selectedFixer.id,
               },
            })

            const remainingTasks = props.api.data?.issues.filter((issue) => issue.task === null).length ?? 0
            const selectedIssuesLength = Object.keys(props.selectedIssues).length

            if (remainingTasks !== selectedIssuesLength) {
               props.resetAll()
            } else {
               setIsLoading(false)
               router.push(`/head-staff/mobile/requests/${props.requestId}`)
            }
         } catch (e) {
            message.error("Tạo tác vụ thất bại").then()
            message.destroy("error")
            message.error({
               content: "Vui lòng điền đầy đủ thông tin tác vụ",
               key: "error",
            })
         } finally {
         }
      },
      [props, mutate_createTask, mutate_assignFixer, form, router, message],
   )

   useEffect(() => {
      setPrevBtnProps({
         children: "Quay lại",
         onClick: () => {
            props.setSelectedFixDate(undefined)
            props.setSelectedPriority(false)
            props.setSelectedTaskName(undefined)
            form.resetFields()
            setStep(0)
         },
         icon: <ArrowLeftOutlined />,
      })
      setNextBtnProps({
         onClick: async () => {
            await handleFinish()
         },
         children: "Tạo tác vụ",
         icon: <ArrowRightOutlined />,
      })

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      form,
      handleFinish,
      props.setSelectedFixDate,
      props.setSelectedPriority,
      props.setSelectedTaskName,
      setNextBtnProps,
      setPrevBtnProps,
      setStep,
   ])

   useEffect(() => {
      if (
         props.selectedFixDate === undefined ||
         props.selectedTaskName === undefined ||
         props.selectedFixer === undefined
      ) {
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
   }, [props.selectedFixDate, props.selectedFixer, props.selectedTaskName, setNextBtnProps])

   return (
      <div className="mt-layout">
         <Form layout="vertical" form={form} onFinish={handleFinish}>
            <ProFormText
               extra={
                  props.api.isSuccess && (
                     <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => {
                           const data = props.api.data! // cannot be undefined because isSuccess
                           const requestDate = dayjs(data.createdAt).format("DDMMYY")
                           const area = data.device.area.name
                           const machine = data.device.machineModel.name
                           const issueCodes = Object.values(props.selectedIssues)
                              .map((e) => {
                                 return e.typeError.id.substring(0, 3)
                              })
                              .join("")
                              .toUpperCase()
                           const str = `${requestDate}_${area}_${machine}_${issueCodes}`
                           form.setFieldsValue({
                              name: str,
                           })
                           props.setSelectedTaskName(str)
                        }}
                     >
                        Tạo tên tác vụ
                     </Button>
                  )
               }
               allowClear
               name="name"
               rules={[{ required: true }]}
               label={"Tên tác vụ"}
               fieldProps={{
                  size: "large",
                  onChange: (e) => props.setSelectedTaskName(e.target.value),
                  value: props.selectedTaskName,
               }}
            />
            <div className="flex justify-between gap-2">
               <ProFormDatePicker
                  label={"Ngày sửa"}
                  name="fixDate"
                  rules={[{ required: true }]}
                  formItemProps={{
                     className: "flex-grow",
                  }}
                  dataFormat="DD-MM-YYYY"
                  fieldProps={{
                     size: "large",
                     className: "w-full",
                     classNames: {
                        popup: "antd-calendar-change-disabled-color",
                     },
                     placeholder: "Chọn ngày sửa chữa cho tác vụ",
                     onChange: (e) => props.setSelectedFixDate(e),
                     value: props.selectedFixDate,
                     disabledDate: (current) => {
                        return current && current < dayjs().startOf("day")
                     },
                  }}
               />
               <Form.Item label="Mức độ ưu tiên" name="priority" initialValue={props.selectedPriority}>
                  <Radio.Group
                     buttonStyle="solid"
                     size="large"
                     className="w-full"
                     onChange={(e) => props.setSelectedPriority(e.target.value)}
                     value={props.selectedPriority}
                  >
                     <Radio.Button value={false}>Thường</Radio.Button>
                     <Radio.Button value={true}>Ưu tiên</Radio.Button>
                  </Radio.Group>
               </Form.Item>
            </div>

            <section>
               <h3 className="mb-2 text-base font-medium">Chọn nhân viên sửa chữa</h3>
               {props.selectedFixDate === undefined ? (
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
                                 extra={
                                    <Tag color={e.hasPriority && props.selectedPriority ? "red-inverse" : "default"}>
                                       {e.hasPriority && props.selectedPriority ? "Đã có ưu tiên" : "Có thời gian"}
                                    </Tag>
                                 }
                                 disabled={e.hasPriority && props.selectedPriority}
                              ></CheckCard>
                           ))}
                  </div>
               )}
            </section>
         </Form>

         {isLoading && <Spin fullscreen />}
      </div>
   )
})

export default Step1_CreateTask
