"use client"

import Cookies from "js-cookie"
import { File_Image_Upload } from "@/_api/file/upload_image.api"
import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_OneById from "@/app/staff/_api/task/one-byId.api"
import Staff_Task_ReceiveSpareParts from "@/app/staff/_api/task/receive-spare-parts.api"
import Staff_Task_UpdateFinish from "@/app/staff/_api/task/update-finish.api"
import IssueDetailsDrawer from "@/app/staff/_components/IssueDetails.drawer"
import StaffScanner from "@/app/staff/_components/StaffScanner"
import DataListView from "@/common/components/DataListView"
import ImageWithCrop from "@/common/components/ImageWithCrop"
import ModalConfirm from "@/common/components/ModalConfirm"
import RootHeader from "@/common/components/RootHeader"
import ScannerDrawer from "@/common/components/Scanner.drawer"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { TaskDto } from "@/common/dto/Task.dto"
import { FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/common/enum/issue-status.enum"
import checkImageUrl from "@/common/util/checkImageUrl.util"
import { cn } from "@/common/util/cn.util"
import { clientEnv } from "@/env"
import { HomeOutlined, RightOutlined } from "@ant-design/icons"
import { CheckCard } from "@ant-design/pro-card"
import { ProDescriptions, ProFormItem, ProFormTextArea } from "@ant-design/pro-components"
import { MapPin } from "@phosphor-icons/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
   App,
   Badge,
   Button,
   Card,
   Checkbox,
   Drawer,
   Form,
   List,
   message,
   Popconfirm,
   QRCode,
   Result,
   Spin,
   Tabs,
   Tag,
   Tooltip,
   Typography,
   Upload,
} from "antd"
import { RcFile, UploadFile } from "antd/es/upload"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { CSSProperties, useEffect, useMemo, useState } from "react"
import { File_Video_Upload } from "@/_api/file/upload_video.api"
import { TaskStatus } from "@/common/enum/task-status.enum"

export default function StartTask({ params }: { params: { id: string } }) {
   const [currentStep, setCurrentStep] = useState<number>(-1)
   const router = useRouter()

   const response = useQuery({
      queryKey: staff_qk.task.one_byId(params.id),
      queryFn: () => Staff_Task_OneById({ id: params.id }),
   })

   useEffect(() => {
      if (response.isSuccess && response.data.status !== TaskStatus.COMPLETED) {
         if (response.data.confirmReceipt === true) {
            setCurrentStep(1)
            return
         }
         setCurrentStep(0)
      }
   }, [response.data, response.isSuccess])

   return (
      <div className="std-layout">
         <RootHeader title="Thông tin chi tiết" className="std-layout-outer p-4" />
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
         {currentStep === 2 && (
            <Step3
               id={params.id}
               handleBack={() => setCurrentStep((prev) => prev - 1)}
               handleNext={() => {
                  router.push("/staff/tasks")
               }}
            />
         )}
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
         <Card className="mt-layout">Please head to the warehouse and show the QR code to the stock keeper.</Card>
         <QRCode value={props.id} className="mx-auto my-6" size={300} status="active"></QRCode>
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
         <div className="fixed bottom-0 left-0 flex w-full items-center justify-between gap-4 bg-white p-layout">
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
   const [hasScanned, setHasScanned] = useState(false)

   const { message } = App.useApp()
   const queryClient = useQueryClient()
   const router = useRouter()

   function onScan(id: string) {
      if (props.data?.device.id !== id) {
         message.error("Mã QR không hợp lệ")
         return
      }

      message.success("Quét mã QR thành công")
      setHasScanned(true)
   }

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
                  label: "Chi tiết tác vụ",
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
                                    ? "Ưu tiên"
                                    : props.data?.priority === false
                                      ? "Thường"
                                      : "-"}
                              </Tag>
                           }
                           columns={[
                              {
                                 label: "Ngày sửa",
                                 render: (_, e) => dayjs(e.fixerDate).add(7, "hours").format("DD/MM/YYYY"),
                              },
                              {
                                 key: "3",
                                 label: "Tổng thời lượng",
                                 render: (_, e) => `${e.totalTime} phút`,
                              },
                              {
                                 key: "2",
                                 label: "Thông số kỹ thuật",
                                 dataIndex: "operator",
                              },
                           ]}
                        />
                        <section className="std-layout-outer mt-6 bg-white py-layout">
                           <h2 className="mb-2 px-layout text-lg font-semibold">Chi tiết thiết bị</h2>
                           <DataListView
                              dataSource={props.data?.device}
                              bordered
                              itemClassName="py-2"
                              labelClassName="font-normal text-neutral-500"
                              className="rounded-lg"
                              items={[
                                 {
                                    label: "Mẫu máy",
                                    value: (s) => s.machineModel?.name,
                                 },
                                 {
                                    label: "Khu vực",
                                    value: (s) => s.area?.name,
                                 },
                                 {
                                    label: "Vị trí (x, y)",
                                    value: (s) => (
                                       <a className="flex items-center gap-1">
                                          {s.positionX} x {s.positionY}
                                          <MapPin size={16} weight="fill" />
                                       </a>
                                    ),
                                 },
                                 {
                                    label: "Nhà sản xuất",
                                    value: (s) => s.machineModel?.manufacturer,
                                 },
                                 {
                                    label: "Năm sản xuất",
                                    value: (s) => s.machineModel?.yearOfProduction,
                                 },
                                 {
                                    label: "Thời hạn bảo hành",
                                    value: (s) => s.machineModel?.warrantyTerm,
                                 },
                                 {
                                    label: "Mô tả",
                                    value: (s) => s.description,
                                 },
                              ]}
                           />
                        </section>
                     </div>
                  ),
               },
               {
                  key: "2",
                  label: "Vấn đề",
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
                           scanCompleted={hasScanned}
                        >
                           {(handleOpen) => (
                              <List
                                 dataSource={props.data?.issues.sort((a, b) =>
                                    a.status === b.status ? 0 : a.status === IssueStatusEnum.PENDING ? -1 : 1,
                                 )}
                                 split={false}
                                 renderItem={(item) => (
                                    <Badge.Ribbon
                                       text={IssueStatusEnumTagMapper[item.status].text}
                                       color={IssueStatusEnumTagMapper[item.status].colorInverse}
                                    >
                                       <Card
                                          size="small"
                                          className={cn(
                                             "mb-2",
                                             item.status === IssueStatusEnum.RESOLVED && "bg-green-100 opacity-40",
                                             item.status === IssueStatusEnum.FAILED && "bg-red-100 opacity-40",
                                          )}
                                          hoverable
                                          onClick={() => handleOpen(item)}
                                       >
                                          <div className="flex flex-col">
                                             <div>
                                                <Typography.Title level={5} className="m-0 font-semibold">
                                                   {item.typeError.name}
                                                </Typography.Title>
                                             </div>
                                             <div className="mt-2 flex items-center justify-between">
                                                <div>
                                                   <Tag color={FixTypeTagMapper[item.fixType].colorInverse}>
                                                      {FixTypeTagMapper[item.fixType].text}
                                                   </Tag>
                                                   <Typography.Text ellipsis={true}>{item.description}</Typography.Text>
                                                </div>
                                                <Button
                                                   icon={<RightOutlined />}
                                                   type={"text"}
                                                   size="small"
                                                   className="self-end justify-self-end"
                                                />
                                             </div>
                                          </div>
                                       </Card>
                                    </Badge.Ribbon>
                                 )}
                              />
                           )}
                        </IssueDetailsDrawer>
                     </div>
                  ),
               },
            ]}
         />
         <ScannerDrawer onScan={onScan}>
            {(handleOpen) => (
               <div className="fixed bottom-0 left-0 flex w-full gap-3 bg-white p-layout">
                  <Button
                     icon={<HomeOutlined />}
                     size="large"
                     className="aspect-square w-16"
                     onClick={() => {
                        router.push("/staff/dashboard")
                     }}
                  />
                  {hasScanned ? (
                     <Button
                        size="large"
                        type="primary"
                        className="w-full"
                        disabled={!props.data?.issues.every((issue) => issue.status !== IssueStatusEnum.PENDING)}
                        onClick={props.handleNext}
                     >
                        Tiếp tục
                     </Button>
                  ) : (
                     <Button size="large" type="primary" className="w-full" onClick={handleOpen}>
                        Quét mã QR để tiếp tục
                     </Button>
                  )}
               </div>
            )}
         </ScannerDrawer>
      </>
   )
}

type SubmitFieldType = {
   fixerNote: string
   imagesVerify: UploadFile
   videosVerify: UploadFile
}

type Step3Props = GeneralProps & {
   id: string
}

function Step3(props: Step3Props) {
   const router = useRouter()
   const [loadingImage, setLoadingImage] = useState(false)
   const { message } = App.useApp()
   const [form] = Form.useForm<SubmitFieldType>()
   const queryClient = useQueryClient()
   const [open, setOpen] = useState(false)

   const mutate_finishTask = useMutation({
      mutationFn: Staff_Task_UpdateFinish,
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

   function handleSubmit(values: SubmitFieldType) {
      console.log("SUBMIT", values)
      mutate_finishTask.mutate(
         {
            id: props.id,
            payload: {
               imagesVerify: [values.imagesVerify.response],
               videosVerify: values.videosVerify?.response ?? "",
               fixerNote: values.fixerNote,
            },
         },
         {
            onSuccess: () => {
               setOpen(true)
            },
         },
      )
   }

   return (
      <div style={props.style}>
         <Card size="small" className="mt-layout">
            Bạn đã sửa chữa thành công tất cả các vấn đề trong tác vụ này. Vui lòng chụp ảnh và quay video chứng minh
            việc sửa chữa để hoàn tất tác vụ!
         </Card>
         <Form<SubmitFieldType>
            form={form}
            className="mt-3"
            onValuesChange={(values) => {
               console.log(values, typeof values.imagesVerify?.[0])
            }}
         >
            <ProFormItem
               name="imagesVerify"
               label="Hình ảnh xác nhận"
               shouldUpdate
               rules={[{ required: true, message: "Vui lòng cập nhật hình ảnh" }]}
            >
               <ImageWithCrop
                  name="image"
                  accept=".jpg,.jpeg,.png,.gif,.bmp,.svg,.webp"
                  customRequest={async (props) => {
                     const file = props.file as RcFile
                     const response = await File_Image_Upload({ file })
                     if (response.status === 201) props.onSuccess?.(response.data.path)
                     else props.onError?.(new Error("Failed to upload file."), response)
                  }}
                  showUploadList={true}
                  listType="picture"
                  multiple={false}
                  maxCount={1}
                  method="POST"
                  headers={{
                     Authorization: `Bearer ${Cookies.get("token")}`,
                  }}
                  isImageUrl={checkImageUrl}
                  className="w-full"
                  onChange={(info) => {
                     setLoadingImage(false)
                     if (info.file.status === "done") {
                        form.setFieldsValue({ imagesVerify: info.file })
                     }
                     if (info.file.status === "uploading") {
                        setLoadingImage(true)
                     }
                     if (info.file.status === "error") {
                        message.error("Tải tệp thất bại")
                     }
                     if (info.file.status === "removed") {
                        form.setFieldsValue({ imagesVerify: {} })
                        message.success("Tệp đã bị xóa")
                     }
                  }}
               >
                  <div className="flex flex-col items-center justify-center">
                     <Typography.Title level={5}>Nhấp vào đây</Typography.Title>
                     <p>Vui lòng tải hình ảnh lên.</p>
                  </div>
               </ImageWithCrop>
            </ProFormItem>
            <ProFormItem name="videosVerify" label="Video xác nhận" shouldUpdate>
               <Upload.Dragger
                  accept=".mp4,.avi,.flv,.wmv,.mov,.webm,.mkv,.3gp,.3g2,.m4v,.mpg,.mpeg,.m2v,.m4v,.3gp,.3g2,.m4v,.mpg,.mpeg,.m2v,.m4v"
                  customRequest={async (props) => {
                     const file = props.file as RcFile
                     const response = await File_Video_Upload({ file })
                     if (response.status === 201) props.onSuccess?.(response.data.path)
                     else props.onError?.(new Error("Failed to upload file."), response)
                  }}
                  showUploadList={true}
                  listType="picture"
                  multiple={false}
                  maxCount={1}
                  method="POST"
                  className="w-full"
                  onChange={(info) => {
                     setLoadingImage(false)
                     if (info.file.status === "done") {
                        form.setFieldsValue({ videosVerify: info.file })
                     }
                     if (info.file.status === "uploading") {
                        setLoadingImage(true)
                     }
                     if (info.file.status === "error") {
                        message.error("Tải tệp thất bại")
                     }
                     if (info.file.status === "removed") {
                        form.setFieldsValue({ videosVerify: {} })
                        message.success("Tệp đã bị xóa")
                     }
                  }}
               >
                  <div className="flex flex-col items-center justify-center">
                     <Typography.Title level={5}>Nhấp vào đây</Typography.Title>
                     <p>Vui lòng tải video lên.</p>
                  </div>
               </Upload.Dragger>
            </ProFormItem>
            <ProFormTextArea
               label="Ghi chú"
               name="fixerNote"
               fieldProps={{
                  placeholder: "Thêm ghi chú",
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
               Quay lại
            </Button>
            <Popconfirm
               title="Lưu ý"
               description="Bạn có chắc chắn hoàn thành tác vụ này không?"
               onConfirm={() => {
                  handleSubmit(form.getFieldsValue())
               }}
               okText="Có"
               cancelText="Không"
            >
               <Button size="large" type="primary" className="w-full">
                  Hoàn thành tác vụ
               </Button>
            </Popconfirm>
         </div>
         <Drawer open={open} onClose={() => setOpen(false)} placement="bottom" height="100%" closeIcon={null}>
            <div className="grid h-full w-full place-content-center">
               <Result
                  title="Bạn đã hoàn thành tác vụ"
                  status="success"
                  subTitle={"Cảm ơn bạn đã hoàn thành tác vụ. Vui lòng chờ xác nhận từ quản lý."}
                  extra={
                     <Button
                        type="primary"
                        onClick={() => {
                           router.push("/staff/dashboard")
                        }}
                     >
                        Quay lại trang chính
                     </Button>
                  }
               />
            </div>
         </Drawer>
      </div>
   )
}
