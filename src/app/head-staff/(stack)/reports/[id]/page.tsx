"use client"

import RootHeader from "@/common/components/RootHeader"
import { useMutation, useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { IssueRequestMock, setIssueRequestMock } from "@/lib/mock/issue-request.mock"
import { ProDescriptions } from "@ant-design/pro-components"
import { LeftOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { App, Button, Card, Tag } from "antd"
import BottomBar from "@/common/components/BottomBar"
import { Modal } from "antd-mobile"
import { mockMutation } from "@/common/util/mock-mutation.util"
import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"

export default function ReportDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { message } = App.useApp()
   const result = useQuery({
      queryKey: qk.issueRequests.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
   })

   const mutate_rejectRequest = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "rejecting-report",
            content: "Rejecting report...",
         })
      },
      onError: async (err) => {
         message.error("Failed to reject report")
      },
      onSuccess: async () => {
         message.success("Report rejected")
         await result.refetch()
      },
      onSettled: () => {
         message.destroy("rejecting-report")
      },
   })

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
                     title: "Reported Date",
                     dataIndex: "createdAt",
                     render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                  },
                  {
                     key: "status",
                     title: "Status",
                     dataIndex: "status",
                     render: (_, e) => <Tag color="default">{e.status}</Tag>,
                  },
                  {
                     key: "account-name",
                     title: "Reported By",
                     render: (_, e) => e.requester.username,
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
                  dataSource={result.data?.device}
                  loading={result.isLoading}
                  size="small"
                  columns={[
                     {
                        key: "device-id",
                        title: "Device ID",
                        dataIndex: "id",
                        render: (_, e) => {
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
                        render: (_, e) => `${e.area.name} - (${e.positionX}, ${e.positionY})`,
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
               <Button
                  danger={true}
                  type="primary"
                  size="large"
                  onClick={() =>
                     Modal.confirm({
                        content: "Are you sure you want to reject this report?",
                        title: "Reject Report",
                        confirmText: "Reject",
                        cancelText: "Cancel",
                        onConfirm: () =>
                           mutate_rejectRequest.mutate({
                              id: params.id,
                              status: IssueRequestStatus.REJECTED,
                           }),
                     })
                  }
               >
                  Reject
               </Button>
               <Button
                  type="primary"
                  size="large"
                  onClick={() => router.push(`/head-staff/reports/${params.id}/start`)}
               >
                  Accept
               </Button>
            </BottomBar>
         )}
      </div>
   )
}
