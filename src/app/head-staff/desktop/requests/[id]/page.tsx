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
import { FixRequestStatusTagMapper } from "@/common/enum/fix-request-status.enum"

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
                    <div key="create-footer" className={"flex items-center p-4"}>
                       <DesktopCreateTaskDrawer
                          afterSuccess={async () => {
                             await queryClient.invalidateQueries({
                                queryKey: headstaff_qk.task.base(),
                             })
                             await queryClient.invalidateQueries({
                                queryKey: headstaff_qk.request.base(),
                             })
                             setSelectedRowKeys([])
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
                                Tạo tác vụ
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
                  <span>Chi tiết yêu cầu</span>
               </div>
            ),
            breadcrumb: {
               items: [
                  {
                     title: "Trang chủ",
                     onClick: () => router.push("/head-staff/desktop/dashboard"),
                  },
                  {
                     title: "Yêu cầu",
                     onClick: () => router.push("/head-staff/desktop/requests"),
                  },
                  {
                     title: "Chi tiết",
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
               tab: "Vấn đề",
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
               tab: "Tác vụ",
               key: "tasks",
               children: (
                  <ProTable
                     headerTitle={
                        <div className="flex items-center gap-2">
                           <span>Tác vụ yêu cầu</span>
                           <span className="text-xs font-normal text-gray-500">
                              {api.data?.tasks.length} tác vụ{api.data?.tasks.length !== 1 && "s"} tìm thấy
                           </span>
                        </div>
                     }
                     dataSource={api.data?.tasks}
                     loading={api.isPending}
                     search={false}
                     columns={[
                        {
                           title: "STT",
                           render: (_, __, index) => index + 1,
                        },
                        {
                           title: "Tên lỗi",
                           dataIndex: "name",
                        },
                        {
                           title: "Trạng thái",
                           dataIndex: "status",
                        },
                        {
                           title: "Ngày tạo",
                           dataIndex: "createdAt",
                           render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("DD-MM-YYYY HH:mm"),
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
                        title: "Ngày tạo",
                        dataIndex: "createdAt",
                        render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("DD-MM-YYYY HH:mm"),
                     },
                     {
                        title: "Ngày cập nhật",
                        dataIndex: "updatedAt",
                        render: (_, e) => dayjs(e.updatedAt).add(7, "hours").format("DD-MM-YYYY HH:mm"),
                     },
                     {
                        title: "Được yêu cầu bởi",
                        render: (_, e) => e.requester?.username ?? "-",
                     },
                     {
                        title: "Ghi chú",
                        span: 3,
                        dataIndex: "requester_note",
                        render: (_, e) => e.requester_note,
                     },
                  ]}
               />
               {api.isSuccess && (
                  <Card size="default">
                     <ProDescriptions
                        title={"Chi tiết thiết bị"}
                        bordered
                        size="middle"
                        dataSource={api.data?.device}
                        columns={[
                           {
                              title: "Mẫu máy",
                              dataIndex: ["machineModel", "name"],
                              render: (_, e) => e.machineModel.name,
                           },
                           {
                              title: "Nhà sản xuất",
                              dataIndex: ["machineModel", "manufacturer"],
                           },
                           {
                              title: "Vị trí",
                              dataIndex: ["area", "positionX", "positionY"],
                              render: (_, e) => `${e.area.name} (${e.positionX}x${e.positionY})`,
                           },
                           {
                              title: "Trạng thái thông số kỹ thuật",
                              dataIndex: "operationStatus",
                           },
                           {
                              title: "Mô tả",
                              dataIndex: "description",
                              span: 3,
                           },
                           {
                              title: "Năm sản xuất",
                              dataIndex: ["machineModel", "yearOfProduction"],
                           },
                           {
                              title: "Ngày nhận",
                              dataIndex: ["machineModel", "dateOfReceipt"],
                           },
                           {
                              title: "Thời hạn bảo hành",
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
