"use client"

import RootHeader from "@/common/components/RootHeader"
import { App, Button, Card, Checkbox, Form, List, Spin, Tabs, Tag, Tooltip, Typography, Upload } from "antd"
import { CSSProperties, useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_OneById from "@/app/staff/_api/task/one-byId.api"
import BottomBar from "@/common/components/BottomBar"
import { useRouter } from "next/navigation"
import { CheckCard } from "@ant-design/pro-card"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { cn } from "@/common/util/cn.util"
import Staff_Task_ReceiveSpareParts from "@/app/staff/_api/task/receive-spare-parts.api"
import { ProDescriptions, ProFormTextArea } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { TaskDto } from "@/common/dto/Task.dto"
import ProList from "@ant-design/pro-list/lib"
import { HomeOutlined, RightOutlined } from "@ant-design/icons"
import IssueDetailsDrawer from "@/app/staff/_components/IssueDetails.drawer"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"
import DeviceDetailsCard from "@/common/components/DeviceDetailsCard"
import ImageWithCrop from "@/common/components/ImageWithCrop"
import { File_Upload } from "@/_api/file/upload_image.api"
import { clientEnv } from "@/env"
import { RcFile } from "antd/es/upload"
import checkImageUrl from "@/common/util/checkImageUrl.util"

export default function StartTask({ params }: { params: { id: string } }) {
   const [currentStep, setCurrentStep] = useState<number>(-1)
   const router = useRouter()

   const response = useQuery({
      queryKey: staff_qk.task.one_byId(params.id),
      queryFn: () => Staff_Task_OneById({ id: params.id }),
   })

   useEffect(() => {
      if (response.isSuccess) {
         if (response.data.confirmReceipt === true) {
            setCurrentStep(1)
            return
         }
         setCurrentStep(0)
      }
   }, [response.data, response.isSuccess])

   return (
      <div className="std-layout">
         <RootHeader title="Start Task" className="std-layout-outer p-4" />
         {currentStep === -1 && <Spin fullscreen={true} />}
         {currentStep === 0 && (
            <Step1
               data={response.data?.issues ?? []}
               id={params.id}
               handleBack={() => router.push("/staff/tasks")}
               handleNext={() => setCurrentStep((prev) => prev + 1)}
               confirmReceipt={response.data?.confirmReceipt ?? false}
            />
         )}
         {currentStep === 1 && (
            <Step2
               handleBack={() => setCurrentStep((prev) => prev - 1)}
               handleNext={() => setCurrentStep((prev) => prev + 1)}
               data={response.data}
               loading={response.isLoading}
               id={params.id}
            />
         )}
         {currentStep === 2 && <Step3 handleBack={() => setCurrentStep((prev) => prev - 1)} />}
      </div>
   )
}

type GeneralProps = {
   style?: CSSProperties
   className?: string
   handleNext?: () => void
   handleBack?: () => void
}

type Step1Props = GeneralProps & {
   data: FixRequestIssueDto[]
   id: string
   confirmReceipt: boolean
}

function Step1(props: Step1Props) {
   const [currentChecked, setCurrentChecked] = useState<{ [key: string]: boolean }>({})
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const mutate_acceptSpareParts = useMutation({
      mutationFn: Staff_Task_ReceiveSpareParts,
      onMutate: async () => {
         message.open({
            type: "loading",
            content: `Loading...`,
            key: `loading`,
         })
      },
      onError: async (error) => {
         message.error({
            content: "An error occurred. Please try again later.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: `Spare parts received successfully.`,
         })
         await queryClient.invalidateQueries({
            queryKey: staff_qk.task.one_byId(props.id),
         })
      },
      onSettled: () => {
         message.destroy(`loading`)
      },
   })

   const totalSpareParts = useMemo(() => {
      return props.data.reduce((acc, issue) => {
         return acc + issue.issueSpareParts.length
      }, 0)
   }, [props.data])

   return (
      <div style={props.style} className={props.className}>
         <Card className="mt-1">Please head to the warehouse to collect the following spare parts.</Card>
         {props.data.map((issue, index) => (
            <List
               key={issue.id}
               dataSource={issue.issueSpareParts}
               grid={{
                  column: 1,
               }}
               size={"small"}
               itemLayout={"vertical"}
               className={cn("mt-3", index !== 0 && "mt-0")}
               header={
                  index === 0 && (
                     <div className="flex items-center justify-between">
                        <Typography.Title level={5} className="m-0">
                           Spare Parts ({totalSpareParts})
                        </Typography.Title>
                        <Button
                           type="link"
                           size="small"
                           onClick={() => {
                              if (Object.keys(currentChecked).length === totalSpareParts) {
                                 setCurrentChecked({})
                              } else {
                                 setCurrentChecked(
                                    props.data.reduce((acc, issue) => {
                                       issue.issueSpareParts.forEach((item) => {
                                          acc[item.id] = true
                                       })
                                       return acc
                                    }, {} as any),
                                 )
                              }
                           }}
                        >
                           {Object.keys(currentChecked).length === totalSpareParts ? "Unselect All" : "Select All"}
                        </Button>
                     </div>
                  )
               }
               split={false}
               renderItem={(item) => (
                  <CheckCard
                     key={item.id}
                     size="small"
                     className="h-max w-full"
                     bordered={true}
                     title={item.sparePart.name}
                     description={
                        <div className="flex flex-col">
                           <div>
                              <Typography.Text className="mr-2 text-sm text-gray-400">Error:</Typography.Text>
                              <Typography.Text className="text-sm">{issue.typeError.name}</Typography.Text>
                           </div>
                           <div>
                              <Typography.Text className="mr-2 text-sm text-gray-400">Note:</Typography.Text>
                              <Typography.Text className="text-sm">{item.note ?? "-"}</Typography.Text>
                           </div>
                        </div>
                     }
                     extra={
                        <div className="flex items-center">
                           <Tag color="blue">Qty: {item.quantity}</Tag>
                           <Checkbox checked={currentChecked[item.id] ?? false} />
                        </div>
                     }
                     checked={currentChecked[item.id] ?? false}
                     onChange={(checked) => {
                        if (checked) {
                           setCurrentChecked({ ...currentChecked, [item.id]: true })
                        } else {
                           const { [item.id]: _, ...rest } = currentChecked
                           setCurrentChecked(rest)
                        }
                     }}
                  />
               )}
            />
         ))}
         <div className="fixed bottom-0 left-0 flex items-center justify-between gap-4 bg-white p-layout">
            <Button size="large" onClick={props.handleBack} type="dashed">
               Back
            </Button>
            <Tooltip
               title={
                  Object.keys(currentChecked).length !== props.data.length ? "Please select all the spare parts" : ""
               }
            >
               <Button
                  size="large"
                  type="primary"
                  className="w-full"
                  disabled={Object.keys(currentChecked).length !== totalSpareParts}
                  onClick={() => {
                     if (!props.confirmReceipt) {
                        mutate_acceptSpareParts.mutate({
                           id: props.id,
                        })
                     }
                     props.handleNext?.() // TODO make this run on success only
                  }}
               >
                  Next
               </Button>
            </Tooltip>
         </div>
      </div>
   )
}

type Step2Props = GeneralProps & {
   data?: TaskDto
   loading: boolean
   id: string
}

function Step2(props: Step2Props) {
   const queryClient = useQueryClient()
   const router = useRouter()

   if (!props.data) {
      return <div style={props.style}>Loading...</div>
   }

   return (
      <>
         <Tabs
            className="std-layout-outer main-tabs"
            items={[
               {
                  key: "1",
                  label: "Task Details",
                  children: (
                     <div>
                        <ProDescriptions
                           column={1}
                           loading={props.loading}
                           title={props.data.name}
                           dataSource={props.data}
                           size="small"
                           extra={
                              <Tag color={props.data?.priority === true ? "red" : "default"}>
                                 {props.data?.priority === true
                                    ? "Priority"
                                    : props.data?.priority === false
                                      ? "Normal"
                                      : "-"}
                              </Tag>
                           }
                           columns={[
                              {
                                 key: "1",
                                 label: "Created At",
                                 render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                              },
                              {
                                 key: "2",
                                 label: "Operator",
                                 dataIndex: "operator",
                              },
                              {
                                 key: "3",
                                 label: "Total Time",
                                 render: (_, e) => `${e.totalTime} minutes`,
                              },
                           ]}
                        />
                        <DeviceDetailsCard device={props.data?.device} className="mt-2" />
                     </div>
                  ),
               },
               {
                  key: "2",
                  label: "Issues",
                  children: (
                     <div className="pt-1">
                        <IssueDetailsDrawer
                           afterSuccess={() => {
                              queryClient
                                 .invalidateQueries({
                                    queryKey: staff_qk.task.one_byId(props.id),
                                 })
                                 .then()
                           }}
                        >
                           {(handleOpen) => (
                              <List
                                 dataSource={props.data?.issues.sort((a, b) =>
                                    a.status === b.status ? 0 : a.status === IssueStatusEnum.PENDING ? -1 : 1,
                                 )}
                                 split={false}
                                 renderItem={(item) => (
                                    <Card
                                       classNames={{
                                          body: "flex items-center",
                                       }}
                                       size="small"
                                       className={cn(
                                          "mb-2",
                                          item.status === IssueStatusEnum.RESOLVED && "bg-green-100 opacity-40",
                                          item.status === IssueStatusEnum.FAILED && "bg-red-100 opacity-40",
                                       )}
                                       hoverable
                                       onClick={() => handleOpen(item)}
                                    >
                                       <div className="flex-grow">
                                          <Typography.Title level={5} className="m-0 font-semibold">
                                             {item.typeError.name}
                                             <Tag className="ml-3">{item.fixType}</Tag>
                                          </Typography.Title>
                                          <Typography.Text ellipsis={true}>{item.description}</Typography.Text>
                                       </div>
                                       <Button icon={<RightOutlined />} type={"text"} size="large" />
                                    </Card>
                                 )}
                              />
                           )}
                        </IssueDetailsDrawer>
                     </div>
                  ),
               },
            ]}
         />
         <div className="fixed bottom-0 left-0 flex w-full gap-3 bg-white p-layout">
            <Button
               icon={<HomeOutlined />}
               size="large"
               className="aspect-square w-16"
               onClick={() => {
                  router.push("/staff/dashboard")
               }}
            />
            <Button
               size="large"
               type="primary"
               className="w-full"
               disabled={!props.data.issues.every((issue) => issue.status !== IssueStatusEnum.PENDING)}
               onClick={() => {
                  props.handleNext?.()
               }}
            >
               Next
            </Button>
         </div>
      </>
   )
}

type SubmitFieldType = {
   fixerNote: string
   imagesVerify: string[]
   videosVerify: string
}

type Step3Props = GeneralProps & {}

function Step3(props: Step3Props) {
   const router = useRouter()
   const [loadingImage, setLoadingImage] = useState(false)
   const { message } = App.useApp()
   const [form] = Form.useForm<SubmitFieldType>()

   return (
      <div style={props.style}>
         <Card size="small" className="mt-layout">
            You have successfully fixed all issues in this task. Please take photo and video proof of the fix to
            finalize the task!
         </Card>
         <Form form={form} className="mt-3">
            <Form.Item<SubmitFieldType> name="imagesVerify" label="Verification Images">
               <ImageWithCrop
                  name="image"
                  action={clientEnv.BACKEND_URL + File_Upload.URL}
                  accept=".jpg,.jpeg,.png,.gif,.bmp,.svg,.webp"
                  customRequest={async (props) => {
                     const file = props.file as RcFile
                     const response = await File_Upload({ file })
                     if (response.status === 201) props.onSuccess?.(response.data.path)
                     else props.onError?.(new Error("Failed to upload file."), response)
                  }}
                  showUploadList={true}
                  listType="picture"
                  multiple={false}
                  maxCount={1}
                  method="POST"
                  isImageUrl={checkImageUrl}
                  className="w-full"
                  onChange={(info) => {
                     setLoadingImage(false)
                     if (info.file.status === "done") {
                        form.setFieldsValue({ imagesVerify: [info.file.response.path] })
                     }
                     if (info.file.status === "uploading") {
                        setLoadingImage(true)
                     }
                     if (info.file.status === "error") {
                        message.error("Failed to upload image")
                     }
                     if (info.file.status === "removed") {
                        form.setFieldsValue({ imagesVerify: [] })
                        message.success("Image removed")
                     }
                  }}
               >
                  <div className="flex flex-col items-center justify-center">
                     <Typography.Title level={5}>Click here</Typography.Title>
                     <p>Please upload an image.</p>
                  </div>
               </ImageWithCrop>
            </Form.Item>
            <Form.Item<SubmitFieldType> name="videosVerify" label="Verification Video">
               <Upload.Dragger
                  action={clientEnv.BACKEND_URL + File_Upload.URL}
                  accept=".jpg,.jpeg,.png,.gif,.bmp,.svg,.webp"
                  customRequest={async (props) => {
                     const file = props.file as RcFile
                     const response = await File_Upload({ file })
                     if (response.status === 201) props.onSuccess?.(response.data.path)
                     else props.onError?.(new Error("Failed to upload file."), response)
                  }}
                  showUploadList={true}
                  listType="picture"
                  multiple={false}
                  maxCount={1}
                  method="POST"
                  isImageUrl={checkImageUrl}
                  className="w-full"
                  onChange={(info) => {
                     setLoadingImage(false)
                     if (info.file.status === "done") {
                        form.setFieldsValue({ imagesVerify: [info.file.response.path] })
                     }
                     if (info.file.status === "uploading") {
                        setLoadingImage(true)
                     }
                     if (info.file.status === "error") {
                        message.error("Failed to upload image")
                     }
                     if (info.file.status === "removed") {
                        form.setFieldsValue({ imagesVerify: [] })
                        message.success("Image removed")
                     }
                  }}
               >
                  <div className="flex flex-col items-center justify-center">
                     <Typography.Title level={5}>Click here</Typography.Title>
                     <p>Please upload a video.</p>
                  </div>
               </Upload.Dragger>
            </Form.Item>
            <ProFormTextArea
               label="Notes"
               name="fixerNote"
               fieldProps={{
                  placeholder: "Add some notes about the fix",
               }}
            />
         </Form>
         <div className="fixed bottom-0 left-0 flex w-full gap-3 bg-white p-layout">
            <Button
               icon={<HomeOutlined />}
               size="large"
               className="aspect-square w-16"
               onClick={() => {
                  router.push("/staff/dashboard")
               }}
            />
            <Button
               size="large"
               className="w-52"
               onClick={() => {
                  props.handleBack?.()
               }}
            >
               Back
            </Button>
            <Button
               size="large"
               type="primary"
               className="w-full"
               onClick={() => {
                  props.handleNext?.()
               }}
            >
               Finish Task
            </Button>
         </div>
      </div>
   )
}
