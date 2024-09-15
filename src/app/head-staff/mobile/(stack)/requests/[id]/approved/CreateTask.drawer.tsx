"use client"

import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_Task_Create from "@/app/head-staff/_api/task/create.api"
import HeadStaff_Task_UpdateAwaitSparePartToAssignFixer from "@/app/head-staff/_api/task/update-awaitSparePartToAssignFixer.api"
import IssueDetailsDrawer, { IssueDetailsDrawerRefType } from "@/app/head-staff/_components/IssueDetailsDrawer"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import useModalControls from "@/common/hooks/useModalControls"
import { cn } from "@/common/util/cn.util"
import AlertCard from "@/components/AlertCard"
import DataListView from "@/components/DataListView"
import { InfoCircleFilled, ReloadOutlined, WarningOutlined } from "@ant-design/icons"
import { CheckCard } from "@ant-design/pro-components"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import { Divider, Input } from "antd"
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
   useRef,
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
   handleOpen: (requestId: string, defaultIssueIds?: string[]) => void
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
   handleFormSubmit: (fixerId?: string) => void // must include fixerId because setting state is asynchronous
}

const FormContext = createContext<FormContextType | undefined>(undefined)
function useFormContext() {
   return useContext(FormContext)! // cannot be undefined because it's an internal component only. DO NOT EXPORT YOU IDIOT
}

type Props = {
   children?: (handleOpen: (requestId: string, defaultIssueIds?: string[]) => void) => ReactNode
   drawerProps?: DrawerProps
   refetchFn?: () => void
}

const CreateTaskDrawer = forwardRef<CreateTaskDrawerRefType, Props>(function Component({ children, ...props }, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (requestId: string, defaultIssueIds?: string[]) => {
         setRequestId(requestId)
         setIssueIDs(defaultIssueIds ?? [])
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
   })

   const mutate_checkSparePartStock = useMutation({
      mutationFn: HeadStaff_Task_UpdateAwaitSparePartToAssignFixer,
   })

   async function handleFormSubmit(fixerId?: string) {
      if (!api_request.isSuccess || !requestId) return

      try {
         message.destroy("loading")
         message.open({
            type: "loading",
            content: "Vui lòng chờ đợi...",
            key: "loading",
         })
         const task = await mutate_createTask.mutateAsync(
            {
               name,
               fixerDate: fixerDate?.toISOString(),
               fixer: fixerId ?? undefined,
               priority,
               issueIDs,
               totalTime,
               request: requestId,
               operator: 0,
            },
            {
               onSuccess: () => {},
            },
         )

         const updated = await mutate_checkSparePartStock.mutateAsync({ id: task.id }).catch((error) => {
            console.log(error, typeof error)
            if (error instanceof Error && error.message.includes("Not enough spare part")) {
               message.info("Không đủ linh kiện để tạo tác vụ. Tác vụ sẽ được chuyển qua trạng thái chờ linh kiện.")
            } else {
               throw error
            }
         })

         message.destroy("loading")
         message.success("Tạo tác vụ thành công")
         handleClose()
         props.refetchFn?.()
      } catch (error) {
         message.destroy("loading")
         message.error("Tạo tác vụ thất bại")
         console.log(error)
      }
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
      form: { setIssueIDs, issueIDs, setTotalTime },
   } = useFormContext()

   const [selectedIssues, setSelectedIssues] = useState<{ [key: string]: FixRequestIssueDto }>({})

   const issueDetailsDrawerRef = useRef<IssueDetailsDrawerRefType | null>(null)

   const selectedIssuesValues = useMemo(() => Object.values(selectedIssues), [selectedIssues])
   const totalFixTime = useMemo(
      () => selectedIssuesValues.reduce((acc, issue) => acc + issue.typeError.duration, 0),
      [selectedIssuesValues],
   )
   const hasChosenIssueWithMissingSpareParts = useMemo(() => {
      return !!Object.values(selectedIssues).find((issue) =>
         issue.issueSpareParts.find((isp) => isp.quantity > isp.sparePart.quantity),
      )
   }, [selectedIssues])

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
         <main className={cn("mt-layout px-layout pb-40", hasChosenIssueWithMissingSpareParts && "pb-64")}>
            <Form.Item<FieldType> name="issueIDs">
               <section className="mx-auto mb-layout w-max rounded-lg border-2 border-neutral-200 bg-white p-1 px-3 text-center">
                  Chọn các lỗi cho tác vụ
                  <InfoCircleFilled className="ml-2" />
               </section>
               <section className="mb-2 grid grid-cols-2 gap-2">
                  <Button
                     size="middle"
                     className="w-full bg-amber-500 text-sm text-white"
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
                     size="middle"
                     className="w-full bg-blue-700 text-sm text-white"
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
                     <div key={issue.id} className="relative">
                        <CheckCard
                           title={
                              <div className="flex items-center gap-2">
                                 <Checkbox checked={!!selectedIssues[issue.id]} />
                                 <span>{issue.typeError.name}</span>
                              </div>
                           }
                           disabled={issue.task !== null}
                           description={
                              <div className="mt-2 flex flex-col gap-1">
                                 <div className="w-9/12 truncate">
                                    {issue.typeError.duration} phút | {issue.description}
                                 </div>
                                 <div className="mt-2 flex items-center gap-0">
                                    {issue.issueSpareParts.find((isp) => isp.quantity > isp.sparePart.quantity) && (
                                       <Tag color="yellow-inverse">Không đủ linh kiện</Tag>
                                    )}
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
                           className={cn(
                              "m-0 w-full",
                              issue.task === null &&
                                 issue.issueSpareParts.find((isp) => isp.quantity > isp.sparePart.quantity) &&
                                 "border-2 border-yellow-100 bg-yellow-50",
                           )}
                        ></CheckCard>
                        <Button
                           type="link"
                           size="small"
                           className="absolute bottom-4 right-2"
                           onClick={() =>
                              api_request.isSuccess &&
                              issueDetailsDrawerRef.current?.openDrawer(issue.id, api_request.data.device.id, false)
                           }
                        >
                           Xem thêm
                        </Button>
                     </div>
                  ))}
               </div>
            </Form.Item>
         </main>
         <section className="fixed bottom-0 left-0 w-full border-t-2 border-t-neutral-100 bg-white p-layout shadow-fb">
            {hasChosenIssueWithMissingSpareParts && (
               <AlertCard
                  text="Một số linh kiện trong các lỗi được chọn không còn đủ hàng trong kho."
                  className="mb-layout"
               />
            )}
            <div className="mb-layout">
               <section className="flex flex-col gap-2">
                  <div className="flex justify-between">
                     <h5 className="font-medium text-gray-500">Tổng số lỗi</h5>
                     <p className="mt-1">{selectedIssuesValues.length}</p>
                  </div>
                  <div className="flex justify-between">
                     <h5 className="font-medium text-gray-500">Tổng thời gian sửa</h5>
                     <p className="mt-1">{totalFixTime} phút</p>
                  </div>
               </section>
            </div>
            <div className="flex justify-between gap-3">
               <Button type="default" size="middle" onClick={handleClose} className="w-full">
                  Đóng
               </Button>
               <Button
                  type="primary"
                  size="middle"
                  disabled={selectedIssuesValues.length === 0}
                  onClick={handleFinish}
                  className={cn("w-full", hasChosenIssueWithMissingSpareParts && "bg-yellow-500")}
               >
                  Tiếp tục
               </Button>
            </div>
         </section>
         <IssueDetailsDrawer refetch={() => {}} ref={issueDetailsDrawerRef} />
      </>
   )
}

function FormStep_1() {
   const {
      api_request,
      setFormStep,
      formStep,
      form: { fixerDate, setFixerDate, name, setName, priority, setPriority, issueIDs, totalTime },
      handleFormSubmit,
   } = useFormContext()
   const { modal } = App.useApp()

   useEffect(() => {
      if (!api_request.isSuccess) return
      const issues = issueIDs
      const name = generateTaskName(api_request.data, issues)
      setName(name)
   }, [api_request.data, api_request.isSuccess, issueIDs, setName])

   const hasChosenIssueWithMissingSpareParts = useMemo(() => {
      return !!issueIDs.find((issueId) =>
         api_request.data?.issues
            .find((issue) => issue.id === issueId)
            ?.issueSpareParts.find((isp) => isp.quantity > isp.sparePart.quantity),
      )
   }, [api_request.data?.issues, issueIDs])

   function handleSubmit() {
      handleFormSubmit()
   }

   if (formStep !== 1) return null

   return (
      <>
         <main className={cn("relative mt-layout pb-40", hasChosenIssueWithMissingSpareParts && "pb-64")}>
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

            <div className={cn("sticky left-0 top-0 z-50 bg-white px-layout py-layout")}>
               <Form.Item<FieldType> rules={[{ required: true }]} label="Ngày sửa">
                  <DatePicker
                     size="large"
                     className="w-full"
                     placeholder="Chọn ngày sửa chữa cho tác vụ"
                     disabledDate={(current) => current && current < dayjs().startOf("day")}
                     onChange={(date) => setFixerDate(date)}
                     value={fixerDate}
                     format={"DD/MM/YYYY"}
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
            </div>
         </main>
         <section className="fixed bottom-0 left-0 w-full bg-white p-layout shadow-fb">
            {hasChosenIssueWithMissingSpareParts && (
               <AlertCard
                  text="Một số linh kiện trong các lỗi được chọn không còn đủ hàng trong kho."
                  className="mb-layout"
               />
            )}
            <div className="mb-layout">
               <section className="flex flex-col gap-2">
                  <div className="flex justify-between">
                     <h5 className="font-medium text-gray-500">Tổng số lỗi</h5>
                     <p className="mt-1">{issueIDs.length}</p>
                  </div>
                  <div className="flex justify-between">
                     <h5 className="font-medium text-gray-500">Tổng thời gian sửa</h5>
                     <p className="mt-1">{totalTime} phút</p>
                  </div>
               </section>
            </div>
            <div className="flex justify-between gap-3">
               <Button type="default" size="middle" onClick={() => setFormStep(0)} className="w-full">
                  Quay lại
               </Button>
               <Button
                  type="primary"
                  size="middle"
                  className={cn("w-full", hasChosenIssueWithMissingSpareParts && "bg-yellow-500")}
                  onClick={() => {
                     if (hasChosenIssueWithMissingSpareParts) {
                        modal.confirm({
                           centered: true,
                           title: "Lưu ý",
                           content: (
                              <div>
                                 <div>
                                    Một số linh kiện trong các lỗi được chọn{" "}
                                    <strong>không còn đủ hàng trong kho</strong>. Bạn sẽ không thể phân công tác vụ
                                    trước nếu chưa có đủ linh kiện.
                                 </div>
                                 <div className="mt-layout">Bạn có chắc chắn muốn tiếp tục?</div>
                              </div>
                           ),
                           onOk: () => {
                              handleSubmit()
                           },
                           okText: "Tiếp tục",
                           okButtonProps: {
                              className: "bg-yellow-500",
                           },
                           closable: true,
                           maskClosable: true,
                           cancelText: "Hủy",
                        })
                     } else {
                        handleSubmit()
                     }
                  }}
               >
                  Tạo tác vụ
               </Button>
            </div>
         </section>
      </>
   )
}

export function generateTaskName(data: FixRequestDto, selectedIssues: string[]) {
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
