"use client"

import RootHeader from "@/common/components/RootHeader"
import { HomeOutlined, LeftOutlined, PlusOutlined, QrcodeOutlined, ReloadOutlined } from "@ant-design/icons"
import React, { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { NotFoundError } from "@/common/error/not-found.error"
import { ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import { App, Badge, Button, Card, Divider, Drawer, Empty, Form, Result, Space, Tag, Tooltip, Typography } from "antd"
import { useRouter } from "next/navigation"
import Head_Device_OneById from "@/app/head/_api/device/oneById.api"
import Head_Request_Create from "@/app/head/_api/request/create.api"
import { useTranslation } from "react-i18next"
import head_qk from "@/app/head/_api/qk"
import Head_Device_WithRequests from "@/app/head/_api/device/with_requests.api"
import DataListView from "@/common/components/DataListView"
import dayjs from "dayjs"
import { FixRequestStatus, FixRequestStatusTagMapper } from "@/common/enum/fix-request-status.enum"
import useCurrentUser from "@/common/hooks/useCurrentUser"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import useModalControls from "@/common/hooks/useModalControls"

type FieldType = {
   description: string
   selection: string
}

const machineIssues = [
   {
      label: "+ Create new Issue",
      value: "create",
   },
   {
      label: "Power Issues",
      options: [
         { label: "Machine cannot start", value: "Machine cannot start" },
         { label: "Cord is frayed", value: "Cord is frayed" },
         { label: "Power fluctuations cause issues", value: "Power fluctuations cause issues" },
      ],
   },
   {
      label: "Mechanical Issues",
      options: [
         { label: "Motor is jammed", value: "Motor is jammed" },
         { label: "Belts are slipping or broken", value: "Belts are slipping or broken" },
         { label: "Gears are worn", value: "Gears are worn" },
         { label: "Machine needs oiling", value: "Machine needs oiling" },
      ],
   },
   {
      label: "Thread Issues",
      options: [
         { label: "Thread keeps breaking", value: "Thread keeps breaking" },
         { label: "Thread bunching under fabric", value: "Thread bunching under fabric" },
         { label: "Bobbin thread not catching", value: "Bobbin thread not catching" },
         { label: "Upper thread tension problems", value: "Upper thread tension problems" },
      ],
   },
]

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
   const queryClient = useQueryClient()
   const { message } = App.useApp()
   const { t, i18n } = useTranslation()
   const user = useCurrentUser()

   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         form.resetFields()
      },
   })
   const [currentlySelected, setCurrentlySelected] = useState<string | undefined>()

   const results = useQuery({
      queryKey: head_qk.devices.by_id(params.id),
      queryFn: () => Head_Device_OneById({ id: params.id }),
      retry: 0,
      refetchOnWindowFocus: (query) => !(query.state.error?.name === NotFoundError.name),
   })

   const results_withRequest = useQuery({
      queryKey: head_qk.devices.with_requests(params.id),
      queryFn: () => Head_Device_WithRequests({ id: params.id }),
      retry: 0,
      refetchOnWindowFocus: (query) => !(query.state.error?.name === NotFoundError.name),
      enabled: results.isSuccess,
   })

   const filteredRequests = useMemo(() => {
      return results_withRequest.data?.requests.reduce(
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
            all: FixRequestDto[]
            mine: FixRequestDto | undefined
         },
      )
   }, [results_withRequest.data, user.id])

   const mutate_submitIssue = useMutation({
      mutationFn: Head_Request_Create,
      onMutate: async () => {
         message.open({
            type: "loading",
            content: "Creating issue report...",
            key: "submitIssue",
         })
      },
      onError: async () => {
         message.error(t("failedCreateReport"))
      },
      onSuccess: async () => {
         message.success(t("createReportIssueSuccess"))
      },
      onSettled: () => {
         message.destroy("submitIssue")
      },
   })

   function handleSubmit_createIssue(values: FieldType) {
      if (results.isSuccess)
         mutate_submitIssue.mutate(
            {
               requester_note: values.selection === "create" ? values.description : values.selection,
               device: results.data.id,
            },
            {
               onSuccess: async () => {
                  form.resetFields()
                  handleClose()
                  await queryClient.invalidateQueries({
                     queryKey: head_qk.requests.all(),
                  })
                  router.push("/head/history")
               },
            },
         )
      else message.info("Please wait...").then()
   }

   return (
      <>
         <div
            className="std-layout h-full overflow-auto"
            style={{
               gridTemplateRows:
                  results.error instanceof NotFoundError ? "auto 1fr" : results.isSuccess ? "auto auto 1fr" : undefined,
            }}
         >
            <RootHeader
               title="Thông tin chi tiết"
               className="std-layout-outer p-4"
               icon={<LeftOutlined className="text-base" />}
               onIconClick={() => router.back()}
               buttonProps={{
                  type: "text",
               }}
            />
            {results.isError ? (
               <section className="grid h-full flex-grow place-content-center">
                  <Result
                     title={
                        <span className="text-lg">
                           {results.error instanceof NotFoundError ? "Không tìm thấy thiết bị" : "Lỗi truy cập dữ liệu"}
                        </span>
                     }
                     status="error"
                     subTitle={
                        results.error instanceof NotFoundError
                           ? "Chúng tôi không thể tìm thấy thiết bị có ID bạn đã nhập. Vui lòng thử lại"
                           : "Một lỗi không mong muốn đã xảy ra"
                     }
                     extra={
                        <Space>
                           <Button size="large" onClick={() => router.push("/head/scan")} icon={<QrcodeOutlined />}>
                              Quét lại
                           </Button>
                           {!(results.error instanceof NotFoundError) && (
                              <Button
                                 type={"primary"}
                                 icon={<ReloadOutlined />}
                                 size="large"
                                 onClick={() => results.refetch()}
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
                     dataSource={results.data}
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
               </div>
            )}

            <section className="mt-6">
               <h2 className="mb-2 flex justify-between">
                  <span className="mr-2 text-lg font-semibold">Báo cáo của tôi</span>
                  <span className="text-base font-normal text-neutral-500">
                     {results_withRequest.data?.requests.length ?? "-"} báo cáo
                  </span>
               </h2>
               {results_withRequest.isSuccess ? (
                  <div className="grid grid-cols-1 gap-2">
                     {!!filteredRequests?.mine && (
                        <div>
                           <Badge.Ribbon
                              key={filteredRequests.mine.id}
                              color={FixRequestStatusTagMapper[String(filteredRequests.mine.status)].color}
                              text={<span className="capitalize">{filteredRequests.mine.status.toLowerCase()}</span>}
                           >
                              <Card size="small" className="bg-yellow-50">
                                 <div className="flex flex-col gap-2">
                                    <span className="truncate text-base font-medium">
                                       {filteredRequests.mine.requester_note}
                                    </span>
                                    <div className="flex justify-between">
                                       <span>
                                          <span className="text-neutral-500">Created by</span> Head
                                       </span>
                                       <span className="text-neutral-600">
                                          {dayjs(filteredRequests.mine.createdAt).format("DD-MM-YYYY HH:mm")}
                                       </span>
                                    </div>
                                 </div>
                              </Card>
                           </Badge.Ribbon>
                           <Divider className="mb-0 mt-4">Other Requests</Divider>
                        </div>
                     )}
                     {filteredRequests?.all.length === 0 ? (
                        <div className="grid place-content-center rounded-lg border-2 border-dashed border-neutral-300 py-6">
                           <Empty description="Thiết bị này không có báo cáo" />
                        </div>
                     ) : (
                        filteredRequests?.all.map((req) => (
                           <>
                              <Badge.Ribbon
                                 key={req.id}
                                 color={FixRequestStatusTagMapper[String(req.status)].color}
                                 text={<span className="capitalize">{req.status.toLowerCase()}</span>}
                              >
                                 <Card size="small">
                                    <div className="flex flex-col gap-2">
                                       <span className="truncate text-base font-medium">{req.requester_note}</span>
                                       <div className="flex justify-between">
                                          <span>
                                             <span className="text-neutral-500">Được tạo bởi</span> Head // TODO change to name
                                          </span>
                                          <span className="text-neutral-600">
                                             {dayjs(req.createdAt).format("DD-MM-YYYY HH:mm")}
                                          </span>
                                       </div>
                                    </div>
                                 </Card>
                              </Badge.Ribbon>
                           </>
                        ))
                     )}
                  </div>
               ) : (
                  <>
                     {results_withRequest.isPending && <Card loading />}
                     {results_withRequest.isError && (
                        <Card size="small">
                           <div className="grid place-content-center gap-2">
                              <div>Đã xảy ra lỗi. Vui lòng thử lại</div>
                              <Button type="primary" onClick={() => results_withRequest.refetch()}>
                                 Thử lại
                              </Button>
                           </div>
                        </Card>
                     )}
                  </>
               )}
            </section>

            {results.isSuccess && (
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
                           results.isLoading || mutate_submitIssue.isPending || filteredRequests?.mine !== undefined
                        }
                        onClick={handleOpen}
                     >
                        Tạo báo cáo
                     </Button>
                  </Tooltip>
               </div>
            )}
         </div>
         <Drawer
            placement="bottom"
            height="max-content"
            open={open}
            onClose={handleClose}
            title={"Tạo báo cáo"}
         >
            <Form<FieldType> form={form} layout="vertical">
               <ProFormSelect
                  options={i18n.language === "vie" ? loiMay : machineIssues}
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
