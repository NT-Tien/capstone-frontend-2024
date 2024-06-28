"use client"

import RootHeader from "@/common/components/RootHeader"
import { LeftOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { Tag, Typography } from "antd"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import Head_Request_All from "@/app/head/_api/request/all.api"
import { NotFoundError } from "@/common/error/not-found.error"
import { IssueRequestStatusTag } from "@/common/enum/issue-request-status.enum"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import Head_Device_OneById from "@/app/head/_api/device/oneById.api"
import { useTranslation } from "react-i18next"
import { useIssueRequestStatusTranslation } from "@/common/enum/use-issue-request-status-translation"

export default function HistoryDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { t } = useTranslation()
   const response = useQuery({
      queryKey: qk.issueRequests.allRaw(),
      queryFn: () => Head_Request_All(),
      select: (data) => {
         const issue = data.find((d) => d.id === params.id)
         if (!issue) throw new NotFoundError("Issue")
         return issue
      },
   })
   const { getStatusTranslation } = useIssueRequestStatusTranslation();

   const device = useQuery({
      queryKey: qk.devices.one_byId(response.data?.device.id ?? ""),
      queryFn: () => Head_Device_OneById({ id: response.data?.device.id ?? "" }),
      enabled: response.isSuccess,
   })

   return (
      <div
         style={{
            display: "grid",
            gridTemplateColumns: "[outer-start] 16px [inner-start] 1fr [inner-end] 16px [outer-end] 0",
         }}
      >
         <RootHeader
            title="History Details"
            style={{
               gridColumn: "outer-start / outer-end",
            }}
            className="p-4"
            icon={<LeftOutlined className="text-base" />}
            onIconClick={() => router.back()}
            buttonProps={{
               type: "text",
            }}
         />
         <div
            className="mt-3 flex items-center justify-between"
            style={{
               gridColumn: "inner-start / inner-end",
            }}
         >
            <Typography.Title level={4} className="mb-0">
               {t('IssueDetails')}
            </Typography.Title>
            {response.isSuccess ? <IssueRequestStatusTag status={getStatusTranslation(response.data.status)} /> : <Tag>...</Tag>}
         </div>
         <ProDescriptions
            className="mt-2"
            dataSource={device.data}
            loading={device.isLoading}
            size="small"
            style={{
               gridColumn: "inner-start / inner-end",
            }}
            columns={[
               {
                  key: "machineModel",
                  label: t('MachineModel'),
                  render: (_, e) => e.machineModel?.name ?? "-",
               },
               {
                  key: "deviceDescription",
                  label: t('DeviceDescription'),
                  render: (_, e) => e.description,
               },
               {
                  key: "devicePosition",
                  label: t('Position'),
                  render: (_, e) => e.area?.name + ` (${e.positionX} : ${e.positionY})`,
               },
            ]}
         />
         <ProDescriptions
            style={{
               gridColumn: "inner-start / inner-end",
            }}
            dataSource={response.data}
            loading={response.isLoading}
            size="small"
            columns={[
               {
                  key: "createdAt",
                  label: t('Created'),
                  render: (_, e) => dayjs(e.createdAt).format("YYYY-MM-DD HH:mm:ss"),
               },
               {
                  key: "updatedAt",
                  label: t('LastUpdated'),
                  render: (_, e) => dayjs(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
               },
            ]}
         />
         <ProDescriptions
            style={{
               gridColumn: "inner-start / inner-end",
            }}
            dataSource={response.data}
            loading={response.isLoading}
            size="small"
            layout="vertical"
            columns={[
               {
                  key: "attachedNote",
                  label: t('RequesterNote'),
                  render: (_, e) => e.requester_note,
                  span: 2,
               },
            ]}
         />
      </div>
   )
}
