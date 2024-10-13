// "use client"

// import { PageContainer } from "@ant-design/pro-layout"
// import Card from "antd/es/card"
// import Button from "antd/es/button"
// import { Descriptions } from "antd"
// import { useQueries } from "@tanstack/react-query"
// import Admin_Requests_Dashboard from "@/features/admin/api/request/dashboard.api"

// function Page() {
//    const api = useQueries({
//       queries: [
//          {
//             queryKey: ["admin", "requests", "dashboard", "all"],
//             queryFn: () =>
//                Admin_Requests_Dashboard({
//                   endDate: new Date().toISOString(),
//                   startDate: "2024-09-07T02:24:40.298Z",
//                   type: "all",
//                }),
//          },
//          {
//             queryKey: ["admin", "requests", "dashboard", "fix"],
//             queryFn: () =>
//                Admin_Requests_Dashboard({
//                   endDate: new Date().toISOString(),
//                   startDate: "2024-09-07T02:24:40.298Z",
//                   type: "fix",
//                }),
//          },
//          {
//             queryKey: ["admin", "requests", "dashboard", "renew"],
//             queryFn: () =>
//                Admin_Requests_Dashboard({
//                   endDate: new Date().toISOString(),
//                   startDate: "2024-09-07T02:24:40.298Z",
//                   type: "renew",
//                }),
//          },
//          {
//             queryKey: ["admin", "requests", "dashboard", "warranty"],
//             queryFn: () =>
//                Admin_Requests_Dashboard({
//                   endDate: new Date().toISOString(),
//                   startDate: "2024-09-07T02:24:40.298Z",
//                   type: "warranty",
//                }),
//          },
//       ],
//       combine: (data) => ({
//          all: data[0],
//          fix: data[1],
//          renew: data[2],
//          warranty: data[3],
//       }),
//    })

//    return (
//       <PageContainer title="Thống kê" extra={<Button>Bộ lọc</Button>} subTitle="Thông tin trong tháng vừa qua">
//          <article className="grid grid-cols-4 gap-3">
//             <Card size="default" title="Tổng số yêu cầu">
//                <Descriptions
//                   labelStyle={{
//                      flexGrow: 1,
//                   }}
//                   contentStyle={{
//                      textAlign: "right",
//                      justifyContent: "flex-end",
//                   }}
//                   column={1}
//                   size="small"
//                   items={[
//                      {
//                         label: "Tổng",
//                         children: api.all.data ? Object.values(api.all.data).reduce((acc, cur) => acc + cur, 0) : 0,
//                      },
//                      {
//                         label: "Chưa xử lý",
//                         children: api.all.data ? api.all.data.PENDING : 0,
//                      },
//                      {
//                         label: "Xác nhận",
//                         children: api.all.data ? api.all.data.APPROVED : 0,
//                      },
//                      {
//                         label: "Đang thực hiện",
//                         children: api.all.data ? api.all.data.IN_PROGRESS : 0,
//                      },
//                      {
//                         label: "Chờ đánh giá",
//                         children: api.all.data ? api.all.data.HEAD_CONFIRM : 0,
//                      },
//                      {
//                         label: "Đã đóng",
//                         children: api.all.data ? api.all.data.CLOSED : 0,
//                      },
//                      {
//                         label: "Không tiếp nhận",
//                         children: api.all.data ? api.all.data.REJECTED : 0,
//                      },
//                      {
//                         label: "Trưởng phòng hủy",
//                         children: api.all.data ? api.all.data.HEAD_CANCEL : 0,
//                      },
//                   ]}
//                />
//             </Card>
//             <Card size="default" title="Yêu cầu sửa chữa">
//                <Descriptions
//                   labelStyle={{
//                      flexGrow: 1,
//                   }}
//                   contentStyle={{
//                      textAlign: "right",
//                      justifyContent: "flex-end",
//                   }}
//                   column={1}
//                   size="small"
//                   items={[
//                      {
//                         label: "Tổng",
//                         children: api.fix.data ? Object.values(api.fix.data).reduce((acc, cur) => acc + cur, 0) : 0,
//                      },
//                      {
//                         label: "Chưa xử lý",
//                         children: api.fix.data ? api.fix.data.PENDING : 0,
//                      },
//                      {
//                         label: "Xác nhận",
//                         children: api.fix.data ? api.fix.data.APPROVED : 0,
//                      },
//                      {
//                         label: "Đang thực hiện",
//                         children: api.fix.data ? api.fix.data.IN_PROGRESS : 0,
//                      },
//                      {
//                         label: "Chờ đánh giá",
//                         children: api.fix.data ? api.fix.data.HEAD_CONFIRM : 0,
//                      },
//                      {
//                         label: "Đã đóng",
//                         children: api.fix.data ? api.fix.data.CLOSED : 0,
//                      },
//                      {
//                         label: "Không tiếp nhận",
//                         children: api.fix.data ? api.fix.data.REJECTED : 0,
//                      },
//                      {
//                         label: "Trưởng phòng hủy",
//                         children: api.fix.data ? api.fix.data.HEAD_CANCEL : 0,
//                      },
//                   ]}
//                />
//             </Card>
//             <Card size="default" title="Yêu cầu bào hành">
//                <Descriptions
//                   labelStyle={{
//                      flexGrow: 1,
//                   }}
//                   contentStyle={{
//                      textAlign: "right",
//                      justifyContent: "flex-end",
//                   }}
//                   column={1}
//                   size="small"
//                   items={[
//                      {
//                         label: "Tổng",
//                         children: api.warranty.data
//                            ? Object.values(api.warranty.data).reduce((acc, cur) => acc + cur, 0)
//                            : 0,
//                      },
//                      {
//                         label: "Xác nhận",
//                         children: api.warranty.data ? api.warranty.data.APPROVED : 0,
//                      },
//                      {
//                         label: "Đang thực hiện",
//                         children: api.warranty.data ? api.warranty.data.IN_PROGRESS : 0,
//                      },
//                      {
//                         label: "Chờ đánh giá",
//                         children: api.warranty.data ? api.warranty.data.HEAD_CONFIRM : 0,
//                      },
//                      {
//                         label: "Đã đóng",
//                         children: api.warranty.data ? api.warranty.data.CLOSED : 0,
//                      },
//                      {
//                         label: "Không tiếp nhận",
//                         children: api.warranty.data ? api.warranty.data.REJECTED : 0,
//                      },
//                      {
//                         label: "Trưởng phòng hủy",
//                         children: api.warranty.data ? api.warranty.data.HEAD_CANCEL : 0,
//                      },
//                   ]}
//                />
//             </Card>
//             <Card size="default" title="Yêu cầu thay máy">
//                <Descriptions
//                   labelStyle={{
//                      flexGrow: 1,
//                   }}
//                   contentStyle={{
//                      textAlign: "right",
//                      justifyContent: "flex-end",
//                   }}
//                   column={1}
//                   size="small"
//                   items={[
//                      {
//                         label: "Tổng",
//                         children: api.renew.data ? Object.values(api.renew.data).reduce((acc, cur) => acc + cur, 0) : 0,
//                      },
//                      {
//                         label: "Xác nhận",
//                         children: api.renew.data ? api.renew.data.APPROVED : 0,
//                      },
//                      {
//                         label: "Đang thực hiện",
//                         children: api.renew.data ? api.renew.data.IN_PROGRESS : 0,
//                      },
//                      {
//                         label: "Chờ đánh giá",
//                         children: api.renew.data ? api.renew.data.HEAD_CONFIRM : 0,
//                      },
//                      {
//                         label: "Đã đóng",
//                         children: api.renew.data ? api.renew.data.CLOSED : 0,
//                      },
//                      {
//                         label: "Không tiếp nhận",
//                         children: api.renew.data ? api.renew.data.REJECTED : 0,
//                      },
//                      {
//                         label: "Trưởng phòng hủy",
//                         children: api.renew.data ? api.renew.data.HEAD_CANCEL : 0,
//                      },
//                   ]}
//                />
//             </Card>
//          </article>
//       </PageContainer>
//    )
// }

// export default Page
"use client"

import { useQuery } from "@tanstack/react-query"
import { Button, Card, Select, Table, Typography } from "antd"
import Admin_Devices_OneByAreaId from "../../../../features/admin/api/device/one-byAreaId.api"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import CountUp from "react-countup"
import { CheckSquareOffset, Note } from "@phosphor-icons/react"

const areaIds = [
   "13734c3c-5f3b-472e-805f-557c1f08eeb2",
   "4727b5ec-87a9-4aec-9aef-c56f06258426",
   "6b2e4394-239d-437e-b5a5-62be14dea23e",
   "7be024ff-39bb-4ae1-b9a0-996a71e2e966",
   "3d78678d-1f25-4df7-8a84-6640a7692456",
]

export default function AdminHomePage() {
   const [selectedTime, setSelectedTime] = useState<number>(1)
   const router = useRouter()
   const { data, isLoading } = useQuery({
      queryKey: ["areaData"],
      queryFn: async () => {
         const promises = areaIds.map((id) => Admin_Devices_OneByAreaId({ id, time: selectedTime }))
         return Promise.all(promises)
      },
   })

   const tableData = data?.map((areaData, index) => ({
      key: areaIds[index],
      areaNames: `Q${index + 1}`,
      totalRequests: areaData?.total_requests || 0,
      totalTasks: areaData?.total_tasks || 0,
      totalDevices: areaData?.total_devices || 0,
      requestPending: areaData?.request?.pending_requests || 0,
      requestOthers:
         areaData.request.approved_requests +
            areaData.request.checked_requests +
            areaData.request.head_confirm_requests +
            areaData.request.in_progress_requests || 0,
      requestCancel: areaData.request.closed_requests + areaData.request.rejected_requests || 0,
      taskPending: areaData.task.awaiting_fixer + areaData.task.awaiting_spare_spart || 0,
      taskOthers:
         areaData.task.assigned +
            areaData.task.completed +
            areaData.task.in_progress +
            areaData.task.head_staff_confirm || 0,
      taskCancel:
         areaData.task.cancelled +
            areaData.task.close_task_request_cancelled +
            areaData.task.head_staff_confirm_staff_request_cancelled +
            areaData.task.staff_request_cancelled || 0,
   }))

   const totalTasks = tableData?.reduce((acc, area) => acc + (area.totalTasks || 0), 0)
   const totalRequests = tableData?.reduce((acc, area) => acc + (area.totalRequests || 0), 0)

   return (
      <div className="mt-5">
         <div className="mb-4 flex justify-end">
            <Select defaultValue={1} style={{ width: 120 }} onChange={(value) => setSelectedTime(value)}>
               <Select.Option value={1}>1 Tuần</Select.Option>
               <Select.Option value={2}>1 Tháng</Select.Option>
               <Select.Option value={3}>1 Năm</Select.Option>
            </Select>
         </div>
         <div className="grid grid-cols-2 gap-12">
            <Card
               loading={isLoading}
               className={`bourder-neutral-300 mt-5 flex h-24 items-center justify-between rounded-lg border-2 p-0 text-center shadow-md`}
               classNames={{
                  body: "w-full",
               }}
               hoverable
               onClick={() => router.push("/admin/requests")}
            >
               <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-start">
                     <div className="text-xl">Tổng cộng</div>
                     <div className="flex items-center">
                        <CountUp
                           className="flex align-bottom text-3xl font-bold"
                           end={totalRequests as number}
                           separator={","}
                        ></CountUp>
                        <Typography.Text className="ml-2 flex items-end text-base">yêu cầu</Typography.Text>
                     </div>
                  </div>
                  <div className="flex items-center">
                     <Note size={45} weight="duotone" color="text-primary-500" />
                  </div>
               </div>
            </Card>
            <Card
               loading={isLoading}
               className={`bourder-neutral-300 mt-5 flex h-24 items-center justify-between rounded-lg border-2 p-0 text-center shadow-md`}
               classNames={{
                  body: "w-full",
               }}
               hoverable
               onClick={() => router.push("/admin/tasks")}
            >
               <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-start">
                     <div className="text-xl">Tổng cộng</div>
                     <div className="flex items-center">
                        <CountUp
                           className="flex align-bottom text-3xl font-bold"
                           end={totalTasks as number}
                           separator={","}
                        ></CountUp>
                        <Typography.Text className="ml-2 flex items-end text-base">tác vụ</Typography.Text>
                     </div>
                  </div>
                  <div className="flex items-center">
                     <CheckSquareOffset size={45} weight="duotone" />
                  </div>
               </div>
            </Card>
         </div>
         <div
            style={{
               borderRadius: "12px",
               overflow: "hidden",
               boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
               marginTop: "2rem",
            }}
         ></div>
         <div
            style={{
               borderRadius: "12px",
               overflow: "hidden",
               boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
               marginTop: "2rem",
            }}
         >
            <Table
               bordered
               columns={[
                  {
                     title: <div style={{ textAlign: "center" }}>Khu vực</div>,
                     dataIndex: "areaNames",
                     key: "areaNames",
                     align: "center",
                  },
                  {
                     title: <div style={{ textAlign: "center" }}>Yêu cầu</div>,
                     children: [
                        {
                           title: <div style={{ textAlign: "center" }}>Chờ</div>,
                           dataIndex: "requestPending",
                           key: "requestPending",
                           render: (value) => <span style={{ textAlign: "center", display: "block" }}>{value}</span>,
                        },
                        {
                           title: <div style={{ textAlign: "center" }}>Đang xử lý</div>,
                           dataIndex: "requestOthers",
                           key: "requestOthers",
                           render: (value) => <span style={{ textAlign: "center", display: "block" }}>{value}</span>,
                        },
                        {
                           title: <div style={{ textAlign: "center" }}>Hủy</div>,
                           dataIndex: "requestCancel",
                           key: "requestCancel",
                           render: (value) => <span style={{ textAlign: "center", display: "block" }}>{value}</span>,
                        },
                        {
                           title: "",
                           dataIndex: "totalRequests",
                           key: "totalRequests",
                           render: (value, record, index) => (
                              <Button
                                 type="link"
                                 size="small"
                                 onClick={() => router.push(`/admin/dashboard/requests?areaId=${areaIds[index]}`)}
                                 style={{ textAlign: "center", display: "block" }}
                              >
                                 {value}
                              </Button>
                           ),
                        },
                     ],
                  },
                  {
                     title: <div style={{ textAlign: "center" }}>Tác vụ</div>,
                     children: [
                        {
                           title: <div style={{ textAlign: "center" }}>Chờ</div>,
                           dataIndex: "taskPending",
                           key: "taskPending",
                           render: (value) => <span style={{ textAlign: "center", display: "block" }}>{value}</span>,
                        },
                        {
                           title: <div style={{ textAlign: "center" }}>Đang xử lý</div>,
                           dataIndex: "taskOthers",
                           key: "taskOthers",
                           render: (value) => <span style={{ textAlign: "center", display: "block" }}>{value}</span>,
                        },
                        {
                           title: <div style={{ textAlign: "center" }}>Hủy</div>,
                           dataIndex: "taskCancel",
                           key: "taskCancel",
                           render: (value) => <span style={{ textAlign: "center", display: "block" }}>{value}</span>,
                        },
                        {
                           title: "",
                           dataIndex: "totalTasks",
                           key: "totalTasks",
                           render: (value, record, index) => (
                              <Button
                                 type="link"
                                 size="small"
                                 onClick={() => router.push(`/admin/dashboard/tasks?areaId=${areaIds[index]}`)}
                                 style={{ textAlign: "center", display: "block" }}
                              >
                                 <span style={{ textAlign: "center", display: "block" }}>{value}</span>
                              </Button>
                           ),
                        },
                     ],
                  },
                  {
                     title: <div style={{ textAlign: "center" }}>Thiết bị</div>,
                     dataIndex: "totalDevices",
                     key: "totalDevices",
                     align: "center",
                     colSpan: 2,
                     render: (value, record) => (
                        <Button
                           type="link"
                           size="small"
                           onClick={() => router.push(`/admin/devices?area`)}
                        >
                           {value}
                        </Button>
                     ),
                  },
               ]}
               dataSource={tableData}
               loading={isLoading}
               pagination={false}
               style={{
                  borderRadius: "12px",
               }}
               components={{
                  table: (props: any) => (
                     <table
                        {...props}
                        style={{
                           borderRadius: "12px",
                           overflow: "hidden",
                           width: "100%",
                        }}
                     />
                  ),
                  header: {
                     wrapper: (props: any) => (
                        <thead
                           {...props}
                           style={{
                              borderTopLeftRadius: "12px",
                              borderTopRightRadius: "12px",
                              borderWidth: "3px",
                              borderStyle: "solid",
                              borderColor: "#000",
                           }}
                        />
                     ),
                  },
                  body: {
                     wrapper: (props: any) => (
                        <tbody
                           {...props}
                           style={{
                              borderBottomLeftRadius: "12px",
                              borderBottomRightRadius: "12px",
                              borderWidth: "3px",
                              borderStyle: "solid",
                              borderColor: "#000",
                           }}
                        />
                     ),
                  },
               }}
            />
         </div>
      </div>
   )
}
