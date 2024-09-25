"use client"

import Head_Request_Create from "@/features/head-department/api/request/create.api"
import DataListView from "@/components/DataListView"
import RootHeader from "@/components/layout/RootHeader"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { NotFoundError } from "@/lib/error/not-found.error"
import useCurrentUser from "@/lib/domain/User/useCurrentUser"
import useModalControls from "@/lib/hooks/useModalControls"
import { LeftOutlined, PlusOutlined, QrcodeOutlined, ReloadOutlined } from "@ant-design/icons"
import { ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import { useMutation, useQueries } from "@tanstack/react-query"
import { App, Button, Card, Divider, Drawer, Empty, Form, Result, Space, Tag, Tooltip } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import Cookies from "js-cookie"
import { decodeJwt } from "@/lib/domain/User/decodeJwt.util"
import useDevice_OneByIdQuery from "@/features/head-department/queries/Device_OneById.query"
import useDevice_OneById_WithRequestsQuery from "@/features/head-department/queries/Device_OneById_WithRequests.query"

type FieldType = {
   description: string
   selection: string
}

const loiMay = [
   {
      label: "+ Tạo vấn đề mới",
      value: "create",
   },
   {
      label: "Vấn đề nguồn điện",
      options: [
         { label: "Máy không khởi động được", value: "Máy không khởi động được" },
         { label: "Dây điện bị sờn", value: "Dây điện bị sờn" },
         { label: "Điện áp không ổn định gây ra sự cố", value: "Điện áp không ổn định gây ra sự cố" },
      ],
   },
   {
      label: "Vấn đề cơ khí",
      options: [
         { label: "Mô tơ bị kẹt", value: "Mô tơ bị kẹt" },
         { label: "Dây curoa bị trượt hoặc đứt", value: "Dây curoa bị trượt hoặc đứt" },
         { label: "Bánh răng bị mòn", value: "Bánh răng bị mòn" },
         { label: "Máy cần tra dầu", value: "Máy cần tra dầu" },
      ],
   },
   {
      label: "Vấn đề chỉ",
      options: [
         { label: "Chỉ liên tục bị đứt", value: "Chỉ liên tục bị đứt" },
         { label: "Chỉ bị rối dưới vải", value: "Chỉ bị rối dưới vải" },
         { label: "Chỉ suốt không bắt được", value: "Chỉ suốt không bắt được" },
         { label: "Sức căng của chỉ trên có vấn đề", value: "Sức căng của chỉ trên có vấn đề" },
      ],
   },
]

export default function ScanDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()
   const user = useCurrentUser()

   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         form.resetFields()
      },
   })
   const [currentlySelected, setCurrentlySelected] = useState<string | undefined>()

   const api = useQueries({
      queries: [
         useDevice_OneByIdQuery.queryOptions({ deviceId: params.id }),
         useDevice_OneById_WithRequestsQuery.queryOptions({ deviceId: params.id }),
      ],
      combine: (result) => {
         return {
            device: result[0],
            deviceWithRequests: result[1],
         }
      },
   })

   const filteredRequests = useMemo(() => {
      return api.deviceWithRequests.data?.requests.reduce(
         (acc, curr) => {
            if (curr.requester.id === user.id && curr.status === FixRequestStatus.PENDING) {
               return {
                  ...acc,
                  mine: curr,
               }
            }
            return {
               ...acc,
               all: [...acc.all, curr],
            }
         },
         {
            all: [],
            mine: undefined,
         } as {
            all: RequestDto[]
            mine: RequestDto | undefined
         },
      )
   }, [api.deviceWithRequests.data, user.id])

   const mutate_submitIssue = useMutation({
      mutationFn: Head_Request_Create,
      onMutate: async () => {
         message.open({
            type: "loading",
            content: "Vui long chờ...",
            key: "submitIssue",
         })
      },
      onError: async () => {
         message.error("Tạo báo cáo thất bại")
      },
      onSuccess: async () => {
         message.success("Tạo báo cáo thành công")
      },
      onSettled: () => {
         message.destroy("submitIssue")
      },
   })

   function handleSubmit_createIssue(values: FieldType) {
      if (!api.device.isSuccess) return
      mutate_submitIssue.mutate(
         {
            requester_note: values.selection === "create" ? values.description : values.selection,
            device: api.device.data.id,
         },
         {
            onSuccess: async (res) => {
               handleClose()

               setTimeout(async () => {
                  router.push(`/head/history/${res.id}`)
                  await api.deviceWithRequests.refetch()
               }, 500)
            },
         },
      )
   }

   return (
      <>
         <div
            className="std-layout h-full overflow-auto"
            style={{
               gridTemplateRows:
                  api.device.error instanceof NotFoundError
                     ? "auto 1fr"
                     : api.device.isSuccess
                       ? "auto auto 1fr"
                       : undefined,
            }}
         >
            <RootHeader
               title="Thông tin chi tiết"
               className="std-layout-outer p-4"
               icon={<LeftOutlined className="text-base" />}
               onIconClick={() => router.replace("/head/scan")}
               confirmOnIconClick={true}
               confirmModalProps={{
                  title: "Lưu ý",
                  description: "Bạn có chắc chắn muốn rời khỏi trang này?",
                  confirmText: "Rời khỏi",
                  cancelText: "Ở lại",
                  closeBeforeConfirm: true,
               }}
               buttonProps={{
                  type: "text",
               }}
            />
            {api.device.isError ? (
               <section className="grid h-full flex-grow place-content-center">
                  <Result
                     title={
                        <span className="text-lg">
                           {api.device.error instanceof NotFoundError
                              ? "Không tìm thấy thiết bị"
                              : "Lỗi truy cập dữ liệu"}
                        </span>
                     }
                     status="error"
                     subTitle={
                        api.device.error instanceof NotFoundError
                           ? "Chúng tôi không thể tìm thấy thiết bị có ID bạn đã nhập. Vui lòng thử lại"
                           : "Một lỗi không mong muốn đã xảy ra"
                     }
                     extra={
                        <Space>
                           <Button size="large" onClick={() => router.push("/head/scan")} icon={<QrcodeOutlined />}>
                              Quét lại
                           </Button>
                           {!(api.device.error instanceof NotFoundError) && (
                              <Button
                                 type={"primary"}
                                 icon={<ReloadOutlined />}
                                 size="large"
                                 onClick={() => api.device.refetch()}
                              >
                                 Thử lại
                              </Button>
                           )}
                        </Space>
                     }
                  />
               </section>
            ) : (
               <div className="std-layout-outer mt-layout">
                  <h2 className="mb-2 px-layout text-lg font-semibold">Chi tiết thiết bị</h2>
                  <DataListView
                     dataSource={api.device.data}
                     bordered
                     itemClassName="py-2"
                     labelClassName="font-normal text-neutral-500"
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
                              <div>
                                 {s.positionX} x {s.positionY}
                              </div>
                           ),
                        },
                        {
                           label: "Mô tả",
                           value: (s) => s.description,
                        },
                     ]}
                  />
               </div>
            )}
            <section className="mt-6">
               <h2 className="mb-2 flex justify-between">
                  <span className="mr-2 text-lg font-semibold">Báo cáo của tôi</span>
                  <span className="text-base font-normal text-neutral-500">
                     {api.deviceWithRequests.data?.requests.length ?? "-"} báo cáo
                  </span>
               </h2>
               {api.deviceWithRequests.isSuccess ? (
                  <div className="grid grid-cols-1 gap-2">
                     {!!filteredRequests?.mine && (
                        <div>
                           <Card
                              size="small"
                              hoverable
                              onClick={() => router.push(`/head/history/${filteredRequests.mine?.id}?return=scan`)}
                           >
                              <div className="flex flex-col gap-2">
                                 <div className="flex items-center justify-between">
                                    <span className="w-64 truncate text-base font-semibold">
                                       {filteredRequests.mine.requester.username}
                                    </span>
                                    <Tag
                                       color={FixRequest_StatusMapper(filteredRequests.mine).colorInverse}
                                       className="m-0"
                                    >
                                       {FixRequest_StatusMapper(filteredRequests.mine).text}
                                    </Tag>
                                 </div>
                                 <div className="flex justify-between font-normal text-neutral-400">
                                    {filteredRequests.mine.requester_note}
                                 </div>
                                 <span className="text-xs text-neutral-600">
                                    {dayjs(filteredRequests.mine.createdAt).add(7, "hours").format("DD-MM-YYYY HH:mm")}
                                 </span>
                              </div>
                           </Card>
                           <Divider className="mb-0 mt-4">Yêu cầu cũ</Divider>
                        </div>
                     )}
                     {filteredRequests?.all.length === 0 ? (
                        <div className="grid place-content-center rounded-lg border-2 border-dashed border-neutral-300 py-6">
                           <Empty description="Thiết bị này không có báo cáo" />
                        </div>
                     ) : (
                        filteredRequests?.all.map((req) => (
                           <>
                              <Card
                                 size="small"
                                 onClick={() => {
                                    const jwt = Cookies.get("token")
                                    if (!jwt) return
                                    const decoded = decodeJwt(jwt)
                                    if (decoded.id === req.requester.id) {
                                       router.push(`/head/history/${req.id}?return=scan`)
                                    }
                                 }}
                              >
                                 <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                       <span className="w-64 truncate text-base font-semibold">
                                          {req.requester.username}
                                       </span>
                                       <Tag color={FixRequest_StatusMapper(req).colorInverse} className="m-0">
                                          {FixRequest_StatusMapper(req).text}
                                       </Tag>
                                    </div>
                                    <div className="flex justify-between font-normal text-neutral-400">
                                       {req.requester_note}
                                    </div>
                                    <span className="text-xs text-neutral-600">
                                       {dayjs(req.createdAt).add(7, "hours").format("DD-MM-YYYY HH:mm")}
                                    </span>
                                 </div>
                              </Card>
                           </>
                        ))
                     )}
                  </div>
               ) : (
                  <>
                     {api.deviceWithRequests.isPending && <Card loading />}
                     {api.deviceWithRequests.isError && (
                        <Card size="small">
                           <div className="grid place-content-center gap-2">
                              <div>Đã xảy ra lỗi. Vui lòng thử lại</div>
                              <Button type="primary" onClick={() => api.deviceWithRequests.refetch()}>
                                 Thử lại
                              </Button>
                           </div>
                        </Card>
                     )}
                  </>
               )}
            </section>

            {api.device.isSuccess && (
               <div className="std-layout-outer sticky bottom-0 left-0 mt-layout w-full border-t-neutral-200 bg-white p-layout shadow-fb">
                  <Tooltip
                     title={filteredRequests?.mine !== undefined && "You can only have one PENDING request at a time."}
                  >
                     <Button
                        className="w-full"
                        size="large"
                        icon={<PlusOutlined />}
                        type="primary"
                        disabled={
                           api.device.isLoading || mutate_submitIssue.isPending || filteredRequests?.mine !== undefined
                        }
                        onClick={handleOpen}
                     >
                        Tạo báo cáo
                     </Button>
                  </Tooltip>
               </div>
            )}
         </div>
         <Drawer placement="bottom" height="max-content" open={open} onClose={handleClose} title={"Tạo báo cáo"}>
            <Form<FieldType> form={form} layout="vertical">
               <ProFormSelect
                  options={loiMay}
                  label="Vấn đề"
                  fieldProps={{
                     size: "large",
                  }}
                  onChange={(val) => setCurrentlySelected(val as any)}
                  showSearch
                  name="selection"
                  placeholder="Chọn vấn đề"
                  rules={[{ required: true }]}
               />
               <ProFormTextArea
                  name="description"
                  hidden={currentlySelected !== "create"}
                  label="Mô tả"
                  rules={[{ required: true }]}
                  fieldProps={{
                     showCount: true,
                     maxLength: 300,
                  }}
               />
               <Button
                  type="primary"
                  onClick={() => handleSubmit_createIssue(form.getFieldsValue())}
                  className="w-full"
                  size="large"
               >
                  Gửi
               </Button>
            </Form>
         </Drawer>
      </>
   )
}
