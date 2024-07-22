"use client"

import RootHeader from "@/common/components/RootHeader"
import {
   ArrowLeftOutlined,
   ArrowRightOutlined,
   HomeOutlined,
   InfoCircleFilled,
   LeftOutlined,
   PlusOutlined,
   UploadOutlined,
} from "@ant-design/icons"
import React, { createContext, Dispatch, memo, SetStateAction, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { App, Button, ButtonProps, Card, Form, Input, Radio, Steps, Tag } from "antd"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { CheckCard } from "@ant-design/pro-card"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { ProFormDatePicker, ProFormText } from "@ant-design/pro-components"
import dayjs, { Dayjs } from "dayjs"
import { UserDto } from "@/common/dto/User.dto"
import HeadStaff_Users_AllStaff from "@/app/head-staff/_api/users/all.api"
import { TaskDto } from "@/common/dto/Task.dto"
import HeadStaff_Task_Create, { Request as TaskCreateRequest } from "@/app/head-staff/_api/task/create.api"
import HeadStaff_Task_UpdateAssignFixer from "@/app/head-staff/_api/task/update-assignFixer.api"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import { FixRequestStatus } from "@/common/enum/issue-request-status.enum"

type PageContextType = {
   setNextBtnProps: Dispatch<SetStateAction<ButtonProps>>
   setPrevBtnProps: Dispatch<SetStateAction<ButtonProps>>
   setStep: Dispatch<SetStateAction<number>>
}

const PageContext = createContext<PageContextType | undefined>(undefined)

function usePageContext() {
   const context = useContext(PageContext)
   if (context === undefined) {
      throw new Error("usePageContext must be used within a PageContext")
   }
   return context
}

type SelectedIssueType = { [key: string]: FixRequestIssueDto }

export default function NewTaskPage({ params }: { params: { id: string } }) {
   const router = useRouter()

   const [selectedIssues, setSelectedIssues] = useState<SelectedIssueType>({})
   const [selectedFixDate, setSelectedFixDate] = useState<Dayjs | undefined>()
   const [selectedFixer, setSelectedFixer] = useState<UserDto | undefined>()
   const [selectedPriority, setSelectedPriority] = useState<boolean>(false)
   const [selectedTaskName, setSelectedTaskName] = useState<string | undefined>()

   const [prevBtnProps, setPrevBtnProps] = useState<ButtonProps>({})
   const [nextBtnProps, setNextBtnProps] = useState<ButtonProps>({})
   const [step, setStep] = useState<number>(0)

   const api = useQuery({
      queryKey: headstaff_qk.request.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
   })

   return (
      <PageContext.Provider
         value={{
            setStep,
            setNextBtnProps,
            setPrevBtnProps,
         }}
      >
         <div className="h-max min-h-screen-with-navbar">
            <div className="std-layout">
               <RootHeader
                  title="Tác vụ mới"
                  icon={<LeftOutlined />}
                  onIconClick={() => router.back()}
                  className="std-layout-outer p-4"
               />
               <section className="std-layout-outer shadow-bottom w-full bg-white">
                  <Steps
                     size="default"
                     current={step}
                     progressDot
                     direction="horizontal"
                     responsive={false}
                     type="navigation"
                     items={[
                        {
                           title: "Chọn vấn đề",
                           onClick: () => setStep(0),
                        },
                        {
                           title: "Tạo tác vụ",
                           onClick: () => setStep(1),
                        },
                        {
                           title: "Phân công",
                           onClick: () => setStep(2),
                        },
                     ]}
                  />
               </section>
               <main className="h-full">
                  {step === 0 && (
                     <Step0_SelectIssue
                        api={api}
                        selectedIssues={selectedIssues}
                        setSelectedIssues={setSelectedIssues}
                     />
                  )}
                  {step === 1 && (
                     <Step1_CreateTask
                        api={api}
                        selectedFixDate={selectedFixDate}
                        setSelectedFixDate={setSelectedFixDate}
                        selectedPriority={selectedPriority}
                        setSelectedPriority={setSelectedPriority}
                        selectedTaskName={selectedTaskName}
                        setSelectedTaskName={setSelectedTaskName}
                     />
                  )}
                  {step === 2 && (
                     <Step2_ConfirmTask
                        api={api}
                        selectedPriority={selectedPriority}
                        selectedFixDate={selectedFixDate}
                        selectedFixer={selectedFixer}
                        selectedTaskName={selectedTaskName}
                        selectedIssues={selectedIssues}
                        setSelectedFixer={setSelectedFixer}
                     />
                  )}
               </main>
            </div>
         </div>
         <footer className="std-layout-outer h-navbar sticky bottom-0 left-0 flex w-full items-center justify-between gap-3 bg-white p-layout shadow-fb">
            <Button size="large" type="default" {...prevBtnProps}></Button>
            <Button size="large" type="primary" className="w-full" iconPosition="end" {...nextBtnProps}></Button>
         </footer>
      </PageContext.Provider>
   )
}

type Step0_Props = {
   api: UseQueryResult<FixRequestDto, Error>
   selectedIssues: {
      [key: string]: FixRequestIssueDto
   }
   setSelectedIssues: React.Dispatch<React.SetStateAction<{ [key: string]: FixRequestIssueDto }>>
}

const Step0_SelectIssue = memo(function Component(props: Step0_Props) {
   const { setStep, setNextBtnProps, setPrevBtnProps } = usePageContext()
   const sizeSelectedIssues = useMemo(() => Object.values(props.selectedIssues).length, [props.selectedIssues])
   const router = useRouter()

   useEffect(() => {
      setPrevBtnProps({
         children: "Trang chủ",
         onClick: () => {
            router.push("/head-staff/mobile/requests")
         },
         icon: <HomeOutlined />,
      })
      setNextBtnProps({
         onClick: () => {
            setStep(1)
         },
         children: "Tiếp tục",
         icon: <ArrowRightOutlined />,
      })
   }, [router, setNextBtnProps, setPrevBtnProps, setStep])

   useEffect(() => {
      if (sizeSelectedIssues === 0) {
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
   }, [setNextBtnProps, sizeSelectedIssues])

   return (
      <div className="mt-layout">
         <section className="mx-auto mb-layout w-max rounded-lg border-2 border-neutral-200 bg-white p-1 px-3 text-center">
            Chọn vấn đề cho tác vụ
            <InfoCircleFilled className="ml-2" />
         </section>
         <section className="mb-2 grid grid-cols-2 gap-2">
            <Button
               size="large"
               className="w-full bg-amber-500 text-white"
               onClick={() => {
                  props.setSelectedIssues(
                     props.api.data?.issues.reduce((acc, issue) => {
                        if (issue.fixType === FixType.REPAIR) {
                           acc[issue.id] = issue
                        }
                        return acc
                     }, {} as any),
                  )
               }}
            >
               Chọn tất cả SỬA CHỮA
            </Button>
            <Button
               size="large"
               className="w-full bg-blue-700 text-white"
               onClick={() => {
                  props.setSelectedIssues(
                     props.api.data?.issues.reduce((acc, issue) => {
                        if (issue.fixType === FixType.REPLACE) {
                           acc[issue.id] = issue
                        }
                        return acc
                     }, {} as any),
                  )
               }}
            >
               Chọn tất cả THAY THẾ
            </Button>
         </section>
         <Card size="small" className="mb-2">
            <div className="flex justify-between">
               <span>Chọn {sizeSelectedIssues} vấn đề</span>
               {sizeSelectedIssues !== 0 && (
                  <span>
                     <Button type="link" size="small" onClick={() => props.setSelectedIssues({})}>
                        Xóa
                     </Button>
                  </span>
               )}
            </div>
         </Card>
         <div className="grid grid-cols-1 gap-2">
            {props.api.data?.issues
               .filter((issue) => issue.task === null)
               .map((issue) => (
                  <CheckCard
                     key={issue.id}
                     title={issue.typeError.name}
                     description={
                        <div className="flex justify-between">
                           <div className="w-9/12 truncate">{issue.description}</div>
                           <div className="text-neutral-600">{issue.typeError.duration} minute(s)</div>
                        </div>
                     }
                     extra={
                        <Tag
                           color={FixTypeTagMapper[String(issue.fixType)].colorInverse}
                           className="m-0 flex items-center gap-1"
                        >
                           {FixTypeTagMapper[String(issue.fixType)].icon}
                           {FixTypeTagMapper[String(issue.fixType)].text}
                        </Tag>
                     }
                     checked={props.selectedIssues[issue.id] !== undefined}
                     onChange={(checked) => {
                        props.setSelectedIssues((prev) => {
                           if (checked) {
                              return { ...prev, [issue.id]: issue }
                           } else {
                              const { [issue.id]: _, ...rest } = prev
                              return rest
                           }
                        })
                     }}
                     className="m-0 w-full"
                  />
               ))}
         </div>
      </div>
   )
})

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
}

function Step1_CreateTask(props: Step1_Props) {
   const [form] = Form.useForm<FieldType>()
   const { setStep, setNextBtnProps, setPrevBtnProps } = usePageContext()

   function handleFinish() {
      setStep(2)
   }

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
            form.submit()
         },
         children: "Tiếp tục",
         icon: <ArrowRightOutlined />,
      })
   }, [form, props, setNextBtnProps, setPrevBtnProps, setStep])

   useEffect(() => {
      if (props.selectedFixDate === undefined || props.selectedTaskName === undefined) {
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
   }, [props.selectedFixDate, props.selectedTaskName, setNextBtnProps])

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
                           const str = `${props.api.data!.device.machineModel.name}-${props.api.data!.device.area.name}-${props.api.data!.device.positionX}-${props.api.data!.device.positionY}`
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
            <div className="flex gap-4">
               <ProFormDatePicker
                  label={"Ngày sửa chữa"}
                  name="fixDate"
                  rules={[{ required: true }]}
                  formItemProps={{
                     className: "flex-grow",
                  }}
                  fieldProps={{
                     size: "large",
                     className: "w-full",
                     placeholder: "Select a Fix Date for the task",
                     onChange: (e) => props.setSelectedFixDate(e),
                     value: props.selectedFixDate,
                  }}
               />
               <Form.Item label="Mức độ ưu tiên" name="priority" initialValue={false}>
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
         </Form>
      </div>
   )
}

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
   setSelectedFixer: Dispatch<SetStateAction<UserDto | undefined>>
   selectedFixer: UserDto | undefined
   selectedFixDate: Dayjs | undefined
   selectedIssues: SelectedIssueType
   selectedTaskName: string | undefined
   selectedPriority: boolean
}

function Step2_ConfirmTask(props: Step2_Props) {
   const { message } = App.useApp()
   const router = useRouter()

   const { setStep, setNextBtnProps, setPrevBtnProps } = usePageContext()

   const [searchTerm, setSearchTerm] = useState("")

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
               if (dayjs(task.fixerDate).isSame(dayjs(props.selectedFixDate), "date")) {
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
            content: "Creating Task...",
            key: "loading",
         })
      },
   })

   const mutate_assignFixer = useMutation({
      mutationFn: HeadStaff_Task_UpdateAssignFixer,
      onSuccess: async () => {
         message.success("Tạo tác vụ mới thành công.")
      },
      onError: async () => {
         message.error("Tạo tác vụ mới thất bại")
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

   async function handleFinish() {
      if (!props.selectedTaskName || !props.selectedFixDate || !props.api.data || !props.selectedFixer) return

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
         request: props.api.data.id,
         operator: 0,
      })

      if (props.api.data?.status === FixRequestStatus.PENDING) {
         await mutate_updateRequestStatus.mutateAsync({
            id: props.api.data.id,
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

      router.push(`/head-staff/mobile/tasks/${task.id}`)
   }

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
   }, [handleFinish, props, setNextBtnProps, setPrevBtnProps, setStep])

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

   return (
      <section className="mt-layout flex flex-col gap-2">
         <Input.Search
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm"
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
                       title={e.username}
                       size="small"
                       description={"Tổng thời lượng: " + e.totalTime + ` phút`}
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
                       title={e.username}
                       size="small"
                       description={"Tổng thời lượng: " + e.totalTime + ` phút`}
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
      </section>
   )
}
