"use client"

import HeadStaffRootHeader from "@/app/head-staff/_components/HeadStaffRootHeader"
import { useMutation, useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { IssueRequestMock, setIssueRequestMock } from "@/lib/mock/issue-request.mock"
import { mockQuery } from "@/common/util/mock-query.util"
import { ProDescriptions } from "@ant-design/pro-components"
import { NotFoundError } from "@/common/error/not-found.error"
import { LeftOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { App, Button, Card, Tag, Typography } from "antd"
import BottomBar from "@/common/components/BottomBar"
import { Modal } from "antd-mobile"
import { mockMutation } from "@/common/util/mock-mutation.util"

export default function ReportDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { message } = App.useApp()
   const result = useQuery({
      queryKey: qk.issueRequests.byId(params.id),
      queryFn: async () => {
         const response = await mockQuery(IssueRequestMock.find((req) => req.id === params.id))
         if (!response) {
            throw new NotFoundError("Report not found")
         }
         return response
      },
   })

   const mutate_rejectRequest = useMutation({
      mutationFn: () =>
         mockMutation(() => {
            const current = IssueRequestMock
            const index = current.findIndex((val) => val.id === params.id)
            current[index].status = "rejected"
            setIssueRequestMock(current)
         }),
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
         <HeadStaffRootHeader
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
               bordered
               dataSource={result.data}
               size="small"
               columns={[
                  {
                     key: "description",
                     title: "Issue",
                     dataIndex: "description",
                  },
                  {
                     key: "createdAt",
                     title: "Reported Date",
                     dataIndex: "createdAt",
                     render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                  },
                  {
                     key: "account-name",
                     title: "Reported By",
                     render: (_, e) => e.account.username,
                  },
                  {
                     key: "status",
                     title: "Status",
                     dataIndex: "status",
                     render: (_, e) => <Tag color="default">{e.status}</Tag>,
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
                        key: "device-name",
                        title: "Device Machine Model",
                        render: (_, e) => e.machineModel.name,
                     },
                     {
                        key: "device-production-date",
                        title: "Production Date",
                        render: (_, e) => dayjs(e.machineModel.dateOfReceipt).format("DD/MM/YYYY"),
                     },
                     {
                        key: "device-warranty-date",
                        title: "Warranty Date",
                        render: (_, e) => dayjs(e.machineModel.warrantyTerm).format("DD/MM/YYYY"),
                     },
                     {
                        key: "device-manufacturer",
                        title: "Manufacturer",
                        render: (_, e) => e.machineModel.manufacturer,
                     },
                     {
                        key: "device-positioning",
                        title: "Position",
                        render: (_, e) =>
                           `${e.position.area.name} - (${e.position.positionX}, ${e.position.positionY})`,
                     },
                  ]}
               />
            </Card>
         </div>
         {result.data?.status.toLowerCase() === "pending" && (
            <BottomBar className="flex items-center justify-end gap-3 p-4">
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
                        onConfirm: () => mutate_rejectRequest.mutate(),
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
