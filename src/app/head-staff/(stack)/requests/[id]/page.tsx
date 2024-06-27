"use client"

import RootHeader from "@/common/components/RootHeader"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { ProDescriptions } from "@ant-design/pro-components"
import { LeftOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { App, Button, Card, Tag } from "antd"
import BottomBar from "@/common/components/BottomBar"
import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import RejectTaskDrawer from "@/app/head-staff/(stack)/requests/[id]/_components/RejectTask.drawer"
import AcceptTaskDrawer from "@/app/head-staff/(stack)/requests/[id]/_components/AcceptTask.drawer"
import { useTranslation } from "react-i18next"

export default function RequestDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { message } = App.useApp()
   const result = useQuery({
      queryKey: qk.issueRequests.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
   })

   const device = useQuery({
      queryKey: qk.devices.one_byId(result.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: result.data?.device.id ?? "" }),
      enabled: result.isSuccess,
   })
   const { t } = useTranslation()

   return (
      <div>
         <RootHeader
            title="Report Details"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            style={{
               padding: "16px",
            }}
         />
         <div className="p-4">
            <ProDescriptions
               loading={result.isLoading}
               dataSource={result.data}
               size="small"
               columns={[
                  {
                     key: "createdAt",
                     title: t('Created'),
                     dataIndex: "createdAt",
                     render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                  },
                  {
                     key: "status",
                     title: t('Status'),
                     dataIndex: "status",
                     render: (_, e) => <Tag color="default">{e.status}</Tag>,
                  },
                  {
                     key: "account-name",
                     title: "Reported By",
                     render: (_, e) => e.requester?.username ?? "-",
                  },
               ]}
            />
            <ProDescriptions
               loading={result.isLoading}
               dataSource={result.data}
               size="small"
               layout="vertical"
               columns={[
                  {
                     key: "description",
                     title: "Requester Note",
                     render: (_, e) => e.requester_note,
                  },
               ]}
            />
            <Card size="small" className="mt-4" title="Device Details">
               <ProDescriptions
                  // bordered={true}
                  dataSource={device.data}
                  loading={device.isLoading}
                  size="small"
                  columns={[
                     {
                        key: "device-id",
                        title: "Device ID",
                        dataIndex: "id",
                        render: (_, e) => {
                           if (!e.id) return "-"
                           const parts = e.id.split("-")
                           return parts[0] + "..." + parts[parts.length - 1]
                        },
                        copyable: true,
                     },
                     {
                        key: "device-description",
                        title: "Device Description",
                        render: (_, e) => e.description,
                     },
                     {
                        key: "device-positioning",
                        title: "Position",
                        render: (_, e) => `${e.area?.name ?? "..."} - (${e.positionX} : ${e.positionY})`,
                     },
                     {
                        key: "device-machine-model",
                        title: "Machine Model",
                        render: (_, e) => e.machineModel?.name ?? "-",
                     },
                     {
                        key: "manufacturer",
                        title: "Manufacturer",
                        render: (_, e) => e.machineModel?.manufacturer ?? "-",
                     },
                  ]}
               />
            </Card>
         </div>
         {result.data?.status.toLowerCase() === "pending" && (
            <BottomBar className="flex items-center gap-3 p-3">
               <div className="flex-grow">
                  <Button size="large" onClick={() => router.push("/head-staff/reports")}>
                     Back
                  </Button>
               </div>
               <RejectTaskDrawer>
                  {(handleOpen) => (
                     <Button danger={true} type="primary" size="large" onClick={() => handleOpen(params.id)}>
                        Reject
                     </Button>
                  )}
               </RejectTaskDrawer>
               <AcceptTaskDrawer>
                  {(handleOpen) => (
                     <Button type="primary" size="large" onClick={() => handleOpen(params.id)}>
                        Accept
                     </Button>
                  )}
               </AcceptTaskDrawer>
            </BottomBar>
         )}
         {result.data?.status === IssueRequestStatus.APPROVED && (
            <Button size="large" className="fixed bottom-0 left-0 m-4 w-[calc(100%-32px)]" type="primary">
               Goto Task
            </Button>
         )}
      </div>
   )
}
