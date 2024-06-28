"use client"

import RootHeader from "@/common/components/RootHeader"
import { HomeOutlined, LeftOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons"
import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { NotFoundError } from "@/common/error/not-found.error"
import { ProDescriptions, ProFormTextArea } from "@ant-design/pro-components"
import { DeviceDto } from "@/common/dto/Device.dto"
import { App, Button, Drawer, Empty, Form, Typography } from "antd"
import { useRouter } from "next/navigation"
import Head_Device_OneById from "@/app/head/_api/device/oneById.api"
import Head_Request_Create from "@/app/head/_api/request/create.api"
import { useTranslation } from "react-i18next"

type FieldType = {
   description: string
}

export default function ScanDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const [openCreateIssue, setOpenCreateIssue] = useState(false)
   const [form] = Form.useForm<FieldType>()
   const queryClient = useQueryClient()
   const { message } = App.useApp()
   const { t } = useTranslation()
   const results = useQuery({
      queryKey: qk.devices.one_byId(params.id),
      queryFn: () => Head_Device_OneById({ id: params.id }),
      retry: 0,
      refetchOnWindowFocus: (query) => !(query.state.error?.name === NotFoundError.name),
   })

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
         message.error(t('failedCreateReport'))
      },
      onSuccess: async () => {
         message.success(t('createReportIssueSuccess'))
      },
      onSettled: () => {
         message.destroy("submitIssue")
      },
   })

   function handleSubmit_createIssue(values: FieldType) {
      results.isSuccess &&
         mutate_submitIssue.mutate(
            {
               requester_note: values.description,
               device: results.data.id,
            },
            {
               onSuccess: async () => {
                  form.resetFields()
                  setOpenCreateIssue(false)
                  await queryClient.invalidateQueries({
                     queryKey: qk.issueRequests.allRaw(),
                  })
                  router.push("/head/dashboard")
               },
            },
         )
   }

   return (
      <>
         <div
            className="mb-24 grid"
            style={{
               gridTemplateColumns: "0px [outer-start] 16px [inner-start] 1fr [inner-end] 16px [outer-end] 0px",
            }}
         >
            <RootHeader
               title="Device Details"
               className="p-4"
               style={{
                  gridColumn: "outer-start / outer-end",
               }}
               icon={<LeftOutlined className="text-base" />}
               onIconClick={() => router.back()}
               buttonProps={{
                  type: "text",
               }}
            />
            {(results.isSuccess || results.isLoading) && (
               <>
                  <ProDescriptions<DeviceDto>
                     dataSource={results.data}
                     loading={results.isLoading}
                     columns={[
                        {
                           title: t('DeviceId'),
                           dataIndex: "id",
                           render: (_, e) => (
                              <Typography.Text ellipsis={true} className="w-32">
                                 {e.id}
                              </Typography.Text>
                           ),
                        },
                        {
                           title: t('MachineModel'),
                           render: (_, e) => e.machineModel.name,
                        },
                        {
                           title: t('DeviceDescription'),
                           dataIndex: "description",
                        },
                        {
                           title: t('Position'),
                           render: (_, e) => e.area.name + ` (${e.positionX} : ${e.positionY})`,
                        },
                        {
                           title: t('YearOfProduction'),
                           render: (_, e) => e.machineModel.yearOfProduction,
                        },
                        {
                           title: t('Manufacturer'),
                           render: (_, e) => e.machineModel.manufacturer,
                        },
                     ]}
                     size="small"
                     bordered={true}
                     className="mt-4"
                     style={{
                        gridColumn: "inner-start / inner-end",
                     }}
                  />
               </>
            )}
            {results.isError && results.error.name === NotFoundError.name && (
               <Empty
                  description={<Typography.Title level={5}>Device not found. Please try again</Typography.Title>}
                  className="py-20"
                  style={{
                     gridColumn: "inner-start / inner-end",
                  }}
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
            )}
         </div>
         <div className="item-center fixed bottom-0 left-0 flex h-max w-full gap-3 bg-white p-5">
            <Button className="px-8" size="large" onClick={() => router.push("/head/scan")}>
               {t('Back')}
            </Button>
            <Button
               className="flex-grow"
               size="large"
               icon={<PlusOutlined />}
               type="primary"
               disabled={results.isLoading}
               style={{
                  gridColumn: "inner-start / inner-end",
               }}
               onClick={() => setOpenCreateIssue(true)}
            >
               {t('CreateIssueReport')}
            </Button>
         </div>
         <Drawer
            placement="bottom"
            height={250}
            open={openCreateIssue}
            onClose={() => {
               setOpenCreateIssue(false)
               form.resetFields()
            }}
            title="Create Issue Report"
            extra={
               <Button type="primary" onClick={() => form.submit()}>
                  {t('Submit')}
               </Button>
            }
         >
            <Form<FieldType> form={form} onFinish={handleSubmit_createIssue} layout="vertical">
               <ProFormTextArea name="description" label={t('Description')} rules={[{ required: true }]} />
            </Form>
         </Drawer>
      </>
   )
}
