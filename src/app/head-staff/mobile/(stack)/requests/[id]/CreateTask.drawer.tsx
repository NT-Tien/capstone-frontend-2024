"use client"

import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_Task_Create from "@/app/head-staff/_api/task/create.api"
import HeadStaff_Task_UpdateAssignFixer from "@/app/head-staff/_api/task/update-assignFixer.api"
import HeadStaff_Users_AllStaff from "@/app/head-staff/_api/users/all.api"
import DataListView from "@/common/components/DataListView"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { TaskDto } from "@/common/dto/Task.dto"
import { UserDto } from "@/common/dto/User.dto"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { TaskStatus } from "@/common/enum/task-status.enum"
import useModalControls from "@/common/hooks/useModalControls"
import { cn } from "@/common/util/cn.util"
import { InfoCircleFilled, ReloadOutlined, WarningOutlined } from "@ant-design/icons"
import { CheckCard } from "@ant-design/pro-components"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import { Card, Divider, Empty, Input } from "antd"
import App from "antd/es/app"
import Button from "antd/es/button"
import Checkbox from "antd/es/checkbox"
import DatePicker from "antd/es/date-picker"
import Drawer, { DrawerProps } from "antd/es/drawer"
import Form from "antd/es/form"
import Radio from "antd/es/radio"
import Steps from "antd/es/steps"
import Tag from "antd/es/tag"
import dayjs, { Dayjs } from "dayjs"
import {
   createContext,
   forwardRef,
   ReactNode,
   useContext,
   useEffect,
   useImperativeHandle,
   useMemo,
   useState,
} from "react"

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

export type CreateTaskDrawerRefType = {
   handleOpen: (requestId: string) => void
}

type FormContextType = {
   handleClose: () => void
   requestId: string | undefined
   api_request: UseQueryResult<FixRequestDto, Error>
   setFormStep: React.Dispatch<React.SetStateAction<number>>
   formStep: number
   form: {
      setName: React.Dispatch<React.SetStateAction<string>>
      name: string
      setFixer: React.Dispatch<React.SetStateAction<string | undefined>>
      fixer: string | undefined
      setFixerDate: React.Dispatch<React.SetStateAction<Dayjs | undefined>>
      fixerDate: Dayjs | undefined
      setPriority: React.Dispatch<React.SetStateAction<boolean>>
      priority: boolean
      setTotalTime: React.Dispatch<React.SetStateAction<number>>
      totalTime: number
      setIssueIDs: React.Dispatch<React.SetStateAction<string[]>>
      issueIDs: string[]
   }
   handleFormSubmit: () => void
}

const FormContext = createContext<FormContextType | undefined>(undefined)
function useFormContext() {
   return useContext(FormContext)! // cannot be undefined because it's an internal component only. DO NOT EXPORT YOU IDIOT
}

type Props = {
   children?: (handleOpen: (requestId: string) => void) => ReactNode
   drawerProps?: DrawerProps
}

const CreateTaskDrawer = forwardRef<CreateTaskDrawerRefType, Props>(function Component({ children }, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (requestId: string) => {
         setRequestId(requestId)
      },
      onClose: () => {
         setRequestId(undefined)
         setFormStep(0)
         resetFields()
         form.resetFields()
      },
   })
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()

   const [formStep, setFormStep] = useState<number>(0)
   const [requestId, setRequestId] = useState<string | undefined>(undefined)
   const [name, setName] = useState<string>("")
   const [fixer, setFixer] = useState<string | undefined>(undefined)
   const [fixerDate, setFixerDate] = useState<Dayjs | undefined>(undefined)
   const [priority, setPriority] = useState<boolean>(false)
   const [totalTime, setTotalTime] = useState<number>(0)
   const [issueIDs, setIssueIDs] = useState<string[]>([])

   const api_request = useQuery({
      queryKey: headstaff_qk.request.byId(requestId ?? ""),
      queryFn: () => HeadStaff_Request_OneById({ id: requestId ?? "" }),
      enabled: !!requestId,
   })

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
      onSuccess: async () => {
         message.success("Tạo tác vụ thành công")
      },
      onError: async (error) => {
         message.error("Tạo tác vụ thất bại: " + error.message)
      },
      onSettled: async () => {
         message.destroy("loading")
      },
   })

   async function handleFormSubmit() {
      if (!api_request.isSuccess || !requestId) return
      // const totalTime = values.issueIDs.reduce((acc, id) => {
      //    const issue = api_request.data.issues.find((e) => e.id === id)
      //    if (!issue) return acc
      //    return acc + issue.typeError.duration
      // }, 0)
      const task = await mutate_createTask.mutateAsync(
         {
            name,
            fixerDate: fixerDate?.toISOString() ?? undefined,
            fixer: fixer ?? undefined,
            priority,
            issueIDs,
            totalTime,
            request: requestId,
            operator: 0,
         },
         {
            onSuccess: () => {
               handleClose()
            },
         },
      )
   }

   function resetFields() {
      setName("")
      setFixer(undefined)
      setFixerDate(undefined)
      setPriority(false)
      setTotalTime(0)
      setIssueIDs([])
   }

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <FormContext.Provider
         value={{
            formStep,
            handleClose,
            api_request,
            requestId,
            setFormStep,
            form: {
               name,
               setName,
               fixer,
               setFixer,
               fixerDate,
               setFixerDate,
               priority,
               setPriority,
               totalTime,
               setTotalTime,
               issueIDs,
               setIssueIDs,
            },
            handleFormSubmit,
         }}
      >
         {children?.(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title="Tạo tác vụ"
            placement="right"
            width="100%"
            classNames={{
               body: "p-0",
            }}
         >
            <div className="std-layout">
               <Steps
                  size="default"
                  current={formStep}
                  progressDot
                  direction="horizontal"
                  responsive={false}
                  type="navigation"
                  className="std-layout-outer bg-white shadow-lg"
                  items={[
                     {
                        title: "Chọn lỗi",
                     },
                     {
                        title: "Tạo tác vụ",
                     },
                  ]}
               />
               <Form<FieldType> form={form} layout="vertical" className="std-layout-outer">
                  <FormStep_0 />
                  <FormStep_1 />
               </Form>
            </div>
         </Drawer>
      </FormContext.Provider>
   )
})

// Select issues
function FormStep_0() {
   const {
      handleClose,
      api_request,
      setFormStep,
      formStep,
      form: { setIssueIDs, issueIDs, setTotalTime, totalTime },
   } = useFormContext()

   const [selectedIssues, setSelectedIssues] = useState<{ [key: string]: FixRequestIssueDto }>({})
   const selectedIssuesValues = useMemo(() => Object.values(selectedIssues), [selectedIssues])
   const totalFixTime = useMemo(
      () => selectedIssuesValues.reduce((acc, issue) => acc + issue.typeError.duration, 0),
      [selectedIssuesValues],
   )

   function handleFinish() {
      if (selectedIssuesValues.length === 0) return
      setTotalTime(totalFixTime)
      setIssueIDs(selectedIssuesValues.map((e) => e.id))
      setFormStep(1)
   }

   useEffect(() => {
      if (formStep === 0 && api_request.isSuccess) {
         const issueIds = new Set(issueIDs || [])
         setSelectedIssues({
            ...api_request.data.issues.reduce((acc, issue) => {
               if (issueIds.has(issue.id)) {
                  acc[issue.id] = issue
               }
               return acc
            }, {} as any),
         })
      }
   }, [formStep, api_request.data, api_request.isSuccess, issueIDs])

   if (formStep !== 0) return null

   return (
      <>
         <main className="mt-layout px-layout">
            <Form.Item<FieldType> name="issueIDs">
               <section className="mx-auto mb-layout w-max rounded-lg border-2 border-neutral-200 bg-white p-1 px-3 text-center">
                  Chọn các lỗi cho tác vụ
                  <InfoCircleFilled className="ml-2" />
               </section>
               <section className="mb-2 grid grid-cols-2 gap-2">
                  <Button
                     size="large"
                     className="w-full bg-amber-500 text-white"
                     onClick={() => {
                        setSelectedIssues(() => ({
                           ...api_request.data?.issues.reduce((acc, issue) => {
                              if (issue.fixType === FixType.REPAIR && issue.task === null) {
                                 acc[issue.id] = issue
                              }
                              return acc
                           }, {} as any),
                        }))
                     }}
                  >
                     Chọn SỬA CHỮA
                  </Button>
                  <Button
                     size="large"
                     className="w-full bg-blue-700 text-white"
                     onClick={() => {
                        setSelectedIssues(() => ({
                           ...api_request.data?.issues.reduce((acc, issue) => {
                              if (issue.fixType === FixType.REPLACE && issue.task === null) {
                                 acc[issue.id] = issue
                              }
                              return acc
                           }, {} as any),
                        }))
                     }}
                  >
                     Chọn THAY THẾ
                  </Button>
               </section>
               <div className="grid grid-cols-1 gap-2">
                  {api_request.data?.issues.map((issue) => (
                     <CheckCard
                        key={issue.id}
                        title={
                           <div className="flex items-center gap-2">
                              <Checkbox checked={!!selectedIssues[issue.id]} />
                              <span>{issue.typeError.name}</span>
                           </div>
                        }
                        disabled={issue.task !== null}
                        description={
                           <div className="mt-2 flex flex-col gap-1">
                              <div className="w-9/12 truncate">{issue.description}</div>
                              <div>
                                 <Tag>{issue.typeError.duration} phút</Tag>
                                 <Tag color={issue.issueSpareParts.length === 0 ? "red" : "default"}>
                                    {issue.issueSpareParts.length === 0 ? (
                                       <>
                                          <WarningOutlined className="mr-1" />
                                          Chưa có linh kiện
                                       </>
                                    ) : (
                                       `${issue.issueSpareParts.length} linh kiện`
                                    )}
                                 </Tag>
                              </div>
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
                        checked={!!selectedIssues[issue.id]}
                        onChange={(checked) => {
                           if (checked) {
                              setSelectedIssues((prev) => ({
                                 ...prev,
                                 [issue.id]: issue,
                              }))
                           } else {
                              const { [issue.id]: _, ...rest } = selectedIssues
                              setSelectedIssues(rest)
                           }
                        }}
                        className="m-0 w-full"
                     ></CheckCard>
                  ))}
               </div>
            </Form.Item>
         </main>
         <section className="fixed bottom-0 left-0 w-full bg-white p-layout shadow-fb">
            <div className="mb-layout-half">
               <DataListView
                  itemClassName="py-2"
                  itemStyle={{
                     paddingInline: 0,
                  }}
                  labelClassName="font-normal text-neutral-400 text-[14px]"
                  valueClassName="text-[14px] font-medium"
                  dataSource={{
                     totalIssues: selectedIssuesValues.length,
                     totalFixTime: totalFixTime,
                  }}
                  items={[
                     {
                        label: "Tổng số lỗi",
                        value: (e) => e.totalIssues,
                     },
                     {
                        label: "Tổng thời gian sửa",
                        value: (e) => e.totalFixTime + " phút",
                     },
                  ]}
               />
            </div>
            <div className="flex justify-between gap-3">
               <Button type="default" size="large" onClick={handleClose} className="w-full">
                  Đóng
               </Button>
               <Button
                  type="primary"
                  size="large"
                  disabled={selectedIssuesValues.length === 0}
                  onClick={handleFinish}
                  className="w-full"
               >
                  Tiếp tục
               </Button>
            </div>
         </section>
      </>
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

function FormStep_1() {
   const {
      api_request,
      setFormStep,
      formStep,
      form: { fixerDate, setFixerDate, fixer, setFixer, name, setName, priority, setPriority, issueIDs },
      handleFormSubmit,
   } = useFormContext()

   // const selectedPriority = Form.useWatch<boolean>("priority", form)
   // const fixerDate = Form.useWatch<Dayjs>("fixerDate", form)

   const [showAddFixer, setShowAddFixer] = useState<boolean>(false)
   const [selectedFixer, setSelectedFixer] = useState<UserDto | undefined>(undefined)

   const api_user = useQuery({
      queryKey: headstaff_qk.user.all(),
      queryFn: () => HeadStaff_Users_AllStaff(),
   })

   const sorted = useMemo(() => {
      if (!api_user.isSuccess) return
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

   useEffect(() => {
      if (!api_request.isSuccess) return
      const issues = issueIDs
      const name = generateTaskName(api_request.data, issues)
      setName(name)
   }, [api_request.data, api_request.isSuccess, issueIDs])

   function handleSubmit() {
      setFixer(selectedFixer?.id)
      handleFormSubmit()
   }

   if (formStep !== 1) return null

   return (
      <>
         <main className="relative mt-layout pb-32">
            <Form.Item<FieldType> rules={[{ required: true }]} label="Tên tác vụ" className="flex-grow px-layout">
               <Input
                  size="large"
                  allowClear
                  className="w-full"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  suffix={
                     <Button
                        type="primary"
                        size="large"
                        icon={<ReloadOutlined />}
                        onClick={() => {
                           if (!api_request.isSuccess) return
                           const issues = issueIDs
                           setName(generateTaskName(api_request.data, issues))
                        }}
                     />
                  }
               />
            </Form.Item>

            <Divider className="mb-0" />

            <div className={cn("sticky left-0 top-0 z-50 bg-white px-layout py-layout", showAddFixer && "shadow-md")}>
               <Form.Item<FieldType> rules={[{ required: true }]} label="Ngày sửa">
                  <DatePicker
                     size="large"
                     className="w-full"
                     placeholder="Chọn ngày sửa chữa cho tác vụ"
                     disabledDate={(current) => current && current < dayjs().startOf("day")}
                     onChange={(date) => setFixerDate(date)}
                     value={fixerDate}
                  />
               </Form.Item>
               <Form.Item<FieldType> label="Mức độ ưu tiên">
                  <Radio.Group
                     buttonStyle="solid"
                     size="large"
                     className="flex"
                     value={priority}
                     onChange={(e) => setPriority(e.target.value)}
                  >
                     <Radio.Button value={false} className="w-full text-center">
                        Thường
                     </Radio.Button>
                     <Radio.Button value={true} className="w-full text-center">
                        Ưu tiên
                     </Radio.Button>
                  </Radio.Group>
               </Form.Item>
               <section className="mt-layout flex items-center gap-2">
                  <Checkbox
                     id="showAddFixer"
                     checked={showAddFixer}
                     onChange={(e) => setShowAddFixer(e.target.checked)}
                  />
                  <label htmlFor="showAddFixer">Phân công người sửa</label>
               </section>
            </div>
            {showAddFixer && (
               <>
                  <Divider className="mt-0" />
                  <section className="px-layout">
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
                                                <Checkbox checked={selectedFixer?.username === e.username} />
                                                <span>{e.username}</span>
                                             </div>
                                          }
                                          size="small"
                                          description={"Tổng thời gian làm việc: " + e.totalTime + ` phút`}
                                          onClick={() => {
                                             const { hasPriority, sorted_tasks, ...rest } = e
                                             setSelectedFixer({
                                                ...rest,
                                                tasks: [],
                                             })
                                          }}
                                          checked={e.id === selectedFixer?.id}
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
               </>
            )}
         </main>
         <section className="fixed bottom-0 left-0 flex w-full justify-between gap-3 bg-white p-layout shadow-lg">
            <Button type="default" size="large" onClick={() => setFormStep(0)} className="w-full">
               Quay lại
            </Button>
            <Button type="primary" size="large" className="w-full" onClick={handleSubmit}>
               Tạo tác vụ
            </Button>
         </section>
      </>
   )
}

function generateTaskName(data: FixRequestDto, selectedIssues: string[]) {
   const requestDate = dayjs(data.createdAt).format("DDMMYY")
   const area = data.device.area.name
   const machine = data.device.machineModel.name.split(" ").join("-")
   const issueCodes = selectedIssues
      ?.map((e) => {
         return e.substring(0, 3)
      })
      .join("")
      .toUpperCase()

   return `${requestDate}_${area}_${machine}_${issueCodes}`
}

export default CreateTaskDrawer
