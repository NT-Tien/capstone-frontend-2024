"use client"

import RootHeader from "@/common/components/RootHeader"
import { HomeOutlined, LeftOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons"
import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { NotFoundError } from "@/common/error/not-found.error"
import { ProDescriptions, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import { DeviceDto } from "@/common/dto/Device.dto"
import { App, Button, Drawer, Empty, Form, Typography } from "antd"
import { useRouter } from "next/navigation"
import Head_Device_OneById from "@/app/head/_api/device/oneById.api"
import Head_Request_Create from "@/app/head/_api/request/create.api"
import { useTranslation } from "react-i18next"
import DeviceDetailsCard from "@/common/components/DeviceDetailsCard"

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
   const [openCreateIssue, setOpenCreateIssue] = useState(false)
   const [form] = Form.useForm<FieldType>()
   const queryClient = useQueryClient()
   const { message } = App.useApp()
   const { t, i18n } = useTranslation()
   const results = useQuery({
      queryKey: qk.devices.one_byId(params.id),
      queryFn: () => Head_Device_OneById({ id: params.id }),
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
                     queryKey: qk.issueRequests.allRaw(),
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
            {(results.isSuccess || results.isLoading) && (
               <div className="std-layout-grow mt-3">
                  <DeviceDetailsCard device={results.data} />
               </div>
            )}
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
