"use client"

import RootHeader from "@/common/components/RootHeader"
import { HomeOutlined, LeftOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons"
import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { NotFoundError } from "@/common/error/not-found.error"
import { ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import { App, Button, Card, Drawer, Empty, Form, Typography } from "antd"
import { useRouter } from "next/navigation"
import Head_Device_OneById from "@/app/head/_api/device/oneById.api"
import Head_Request_Create from "@/app/head/_api/request/create.api"
import { useTranslation } from "react-i18next"
import DeviceDetailsCard from "@/common/components/DeviceDetailsCard"
import head_qk from "@/app/head/_api/qk"
import qk from "@/app/head/_api/qk"
import Head_Device_WithRequests from "@/app/head/_api/device/with_requests.api"
import { ArchiveBox } from "@phosphor-icons/react"
import DataListView from "@/common/components/DataListView"

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
      value: "Create",
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
   const [openCreateIssue, setOpenCreateIssue] = useState(false)
   const [form] = Form.useForm<FieldType>()
   const queryClient = useQueryClient()
   const { message } = App.useApp()
   const { t, i18n } = useTranslation()

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
   })

   const [currentlySelected, setCurrentlySelected] = useState<string | undefined>()

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
                  setOpenCreateIssue(false)
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
         <div className="std-layout h-full">
            <RootHeader
               title="Scan Results"
               className="std-layout-outer p-4"
               icon={<LeftOutlined className="text-base" />}
               onIconClick={() => router.back()}
               buttonProps={{
                  type: "text",
               }}
            />
            <div className="std-layout-grow mt-3">
               <DataListView
                  dataSource={results.data}
                  items={[
                     {
                        label: "Machine Model",
                        value: (s) => s.machineModel?.name,
                     },
                     {
                        label: "Position",
                        value: (s) => `${s.area?.name} (${s.positionX}x${s.positionY})`,
                     },
                     {
                        label: "Manufacturer",
                        value: (s) => s.machineModel?.manufacturer,
                     },
                     {
                        label: "Year of Production",
                        value: (s) => s.machineModel?.yearOfProduction,
                     },
                     {
                        label: "Warrenty Term",
                        value: (s) => s.machineModel?.warrantyTerm,
                     },
                     {
                        label: "Description",
                        value: (s) => s.description,
                     },
                  ]}
               />
               <section className="mt-6">
                  <Typography.Title level={5}>Requests</Typography.Title>
                  {results_withRequest.isSuccess ? (
                     results_withRequest.data.requests.length === 0 ? (
                        <Card size="small">
                           <Empty description="This device has no requests" />
                        </Card>
                     ) : (
                        <div className="grid grid-cols-1 gap-1">
                           {results_withRequest.data.requests.map((req, index) => (
                              <Card size="small" key={req.id}>
                                 {req.requester_note}
                              </Card>
                           ))}
                        </div>
                     )
                  ) : (
                     <>
                        {results_withRequest.isPending && <Card loading />}
                        {results_withRequest.isError && (
                           <Card size="small">
                              <div className="grid place-content-center gap-2">
                                 <div>An unexpected error has occurred. Please try again</div>
                                 <Button type="primary" onClick={() => results_withRequest.refetch()}>
                                    Retry
                                 </Button>
                              </div>
                           </Card>
                        )}
                     </>
                  )}
               </section>
            </div>
            {results.isError && results.error.name === NotFoundError.name ? (
               <div className="std-layout-grow grid place-items-center">
                  <Empty
                     description={<Typography.Title level={5}>Device not found. Please try again</Typography.Title>}
                  >
                     <div className="flex w-full items-center justify-center gap-3">
                        <Button type="primary" onClick={() => router.push("/head/scan")} icon={<ReloadOutlined />}>
                           Scan Again
                        </Button>
                        <Button onClick={() => router.push("/head/dashboard")} icon={<HomeOutlined />}>
                           Return Home
                        </Button>
                     </div>
                  </Empty>
               </div>
            ) : (
               <div className="std-layout-outer p-layout">
                  <Button
                     className="w-full"
                     size="large"
                     icon={<PlusOutlined />}
                     type="primary"
                     disabled={results.isLoading}
                     onClick={() => setOpenCreateIssue(true)}
                  >
                     {t("CreateIssueReport")}
                  </Button>
               </div>
            )}
         </div>
         <Drawer
            placement="bottom"
            height="max-content"
            open={openCreateIssue}
            onClose={() => {
               setOpenCreateIssue(false)
               form.resetFields()
            }}
            title={t("CreateIssueReport")}
         >
            <Form<FieldType> form={form} layout="vertical">
               <ProFormSelect
                  options={i18n.language === "vie" ? loiMay : machineIssues}
                  label="Issue"
                  fieldProps={{
                     size: "large",
                  }}
                  onChange={(val) => setCurrentlySelected(val as any)}
                  showSearch
                  name="selection"
                  placeholder="Select an issue"
                  rules={[{ required: true }]}
               />
               <ProFormTextArea
                  name="description"
                  hidden={currentlySelected !== "create"}
                  label={t("Description")}
                  rules={[{ required: true }]}
               />
               <Button
                  type="primary"
                  onClick={() => handleSubmit_createIssue(form.getFieldsValue())}
                  className="w-full"
                  size="large"
               >
                  {t("Submit")}
               </Button>
            </Form>
         </Drawer>
      </>
   )
}
