"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import { Button, Card, Tag } from "antd"
import { useRouter } from "next/navigation"
import { PageContainer } from "@ant-design/pro-layout"
import { LeftOutlined, PlusOutlined } from "@ant-design/icons"
import { ProDescriptions, ProTable } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { Key, useState } from "react"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import IssuesTab from "@/app/head-staff/desktop/requests/[id]/IssuesTab"
import DesktopCreateTaskDrawer from "@/app/head-staff/_components/DesktopCreateTask.drawer"
import dynamic from "next/dynamic"
import { FixRequestStatusTagMapper } from "@/common/enum/issue-request-status.enum"

// render this component SOLELY on the client (no server side pre-rendering) because of a bug with the ProTable Footer
export default dynamic(() => Promise.resolve(RequestDetails), {
   ssr: false,
})

function RequestDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const queryClient = useQueryClient()

   const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

   const api = useQuery({
      queryKey: headstaff_qk.request.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
   })

   const device = useQuery({
      queryKey: headstaff_qk.device.byId(api.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: api.data?.device.id ?? "" }),
      enabled: api.isSuccess,
   })

   return (
      <PageContainer
         footer={[
            ...(selectedRowKeys.length > 0
               ? [
                    <div className={"flex items-center p-4"}>
                       <DesktopCreateTaskDrawer
                          afterSuccess={async () => {
                             await queryClient.invalidateQueries({
                                queryKey: headstaff_qk.task.base(),
                             })
                             await queryClient.invalidateQueries({
                                queryKey: headstaff_qk.request.base(),
                             })
                          }}
                       >
                          {(handleOpen) => (
                             <Button
                                type="primary"
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                   handleOpen(
                                      params.id,
                                      selectedRowKeys.map((k) => k.toString()),
                                   )
                                }}
                             >
                                Create Task
                             </Button>
                          )}
                       </DesktopCreateTaskDrawer>
                    </div>,
                 ]
               : []),
         ]}
         header={{
            title: (
               <div className="flex items-center gap-3">
                  <Button icon={<LeftOutlined />} onClick={router.back} />
                  <span>Request Details</span>
               </div>
            ),
            breadcrumb: {
               items: [
                  {
                     title: "Dashboard",
                     onClick: () => router.push("/head-staff/desktop/dashboard"),
                  },
                  {
                     title: "Requests",
                     onClick: () => router.push("/head-staff/desktop/requests"),
                  },
                  {
                     title: "Details",
                  },
               ],
            },
            tags: [
               <Tag key="status" color={FixRequestStatusTagMapper[String(api.data?.status)].colorInverse}>
                  {FixRequestStatusTagMapper[String(api.data?.status)].text}
               </Tag>,
            ],
         }}
         tabList={[
            {
               tab: "Issues",
               key: "issues",
               children: (
                  <IssuesTab
                     id={params.id}
                     issues={api.data?.issues}
                     device={device.data}
                     isLoading={api.isPending}
                     refetch={api.refetch}
                     selectedRowKeys={selectedRowKeys}
                     setSelectedRowKeys={setSelectedRowKeys}
                  />
               ),
            },
            {
               tab: "Tasks",
               key: "tasks",
               children: (
                  <ProTable
                     headerTitle={
                        <div className="flex items-center gap-2">
                           <span>Request Tasks</span>
                           <span className="text-xs font-normal text-gray-500">
                              {api.data?.tasks.length} task{api.data?.tasks.length !== 1 && "s"} found
                           </span>
                        </div>
                     }
                     dataSource={api.data?.tasks}
                     loading={api.isPending}
                     search={false}
                     columns={[
                        {
                           title: "No.",
                           render: (_, __, index) => index + 1,
                        },
                        {
                           title: "Error",
                           dataIndex: "name",
                        },
                        {
                           title: "Status",
                           dataIndex: "status",
                        },
                        {
                           title: "Created",
                           dataIndex: "createdAt",
                           render: (_, e) => dayjs(e.createdAt).format("DD-MM-YYYY HH:mm"),
                        },
                     ]}
                  />
               ),
            },
         ]}
         content={
            <>
               <ProDescriptions
                  dataSource={api.data}
                  loading={api.isPending}
                  columns={[
                     {
                        title: "Created",
                        dataIndex: "createdAt",
                        render: (_, e) => dayjs(e.createdAt).format("DD-MM-YYYY HH:mm"),
                     },
                     {
                        title: "Updated",
                        dataIndex: "updatedAt",
                        render: (_, e) => dayjs(e.updatedAt).format("DD-MM-YYYY HH:mm"),
                     },
                     {
                        title: "Requested By",
                        render: (_, e) => e.requester?.username ?? "-",
                     },
                     {
                        title: "Requester Note",
                        span: 3,
                        dataIndex: "requester_note",
                        render: (_, e) => e.requester_note,
                     },
                  ]}
               />
               {api.isSuccess && (
                  <Card size="default">
                     <ProDescriptions
                        title={"Device"}
                        bordered
                        size="middle"
                        dataSource={api.data?.device}
                        columns={[
                           {
                              title: "Machine Model",
                              dataIndex: ["machineModel", "name"],
                              render: (_, e) => e.machineModel.name,
                           },
                           {
                              title: "Manufacturer",
                              dataIndex: ["machineModel", "manufacturer"],
                           },
                           {
                              title: "Position",
                              dataIndex: ["area", "positionX", "positionY"],
                              render: (_, e) => `${e.area.name} (${e.positionX}x${e.positionY})`,
                           },
                           {
                              title: "Operation Status",
                              dataIndex: "operationStatus",
                           },
                           {
                              title: "Description",
                              dataIndex: "description",
                              span: 3,
                           },
                           {
                              title: "Year of Production",
                              dataIndex: ["machineModel", "yearOfProduction"],
                           },
                           {
                              title: "Date of Receipt",
                              dataIndex: ["machineModel", "dateOfReceipt"],
                           },
                           {
                              title: "Warranty Term",
                              dataIndex: ["machineModel", "warrantyTerm"],
                           },
                        ]}
                     />
                  </Card>
               )}
            </>
         }
         className="relative pb-10"
         childrenContentStyle={{
            position: "relative",
         }}
      ></PageContainer>
   )
}
