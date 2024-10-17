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
      queryKey: ["areaData", selectedTime],
      queryFn: async () => {
         const promises = areaIds.map((id) => Admin_Devices_OneByAreaId({ id, time: selectedTime }))
         return Promise.all(promises)
      },
      enabled: selectedTime !== null,
   })

   const tableData = data?.map((areaData, index) => ({
      key: areaIds[index],
      areaId: areaIds[index],
      areaNames: `Q${index + 1}`,
      totalRequests: areaData?.total_requests || 0,
      totalTasks: areaData?.total_tasks || 0,
      totalDevices: areaData?.total_devices || 0,
      requestPending: areaData?.request?.pending_requests || 0,
      requestOthers:
         areaData.request.approved_requests +
            // areaData.request.checked_requests +
            areaData.request.head_confirm_requests +
            areaData.request.in_progress_requests || 0,
      requestCancel:
         areaData.request.closed_requests +
            areaData.request.rejected_requests +
            areaData.request.head_cancel_requests || 0,
      taskPending: areaData.task.awaiting_fixer + areaData.task.awaiting_spare_spart || 0,
      taskOthers: areaData.task.assigned + areaData.task.in_progress + areaData.task.head_staff_confirm || 0,
      taskCancel:
         areaData.task.cancelled +
            areaData.task.completed +
            areaData.task.close_task_request_cancelled +
            areaData.task.head_staff_confirm_staff_request_cancelled +
            areaData.task.staff_request_cancelled || 0,
   }))

   const totalTasks = tableData?.reduce((acc, area) => acc + (area.totalTasks || 0), 0)
   const totalRequests = tableData?.reduce((acc, area) => acc + (area.totalRequests || 0), 0)

   return (
      <div className="mt-5">
         <div className="mb-4 flex justify-end">
            <Select
               defaultValue={selectedTime}
               style={{ width: 120 }}
               onChange={(value) => setSelectedTime(Number(value))}
            >
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
               onClick={() => router.push("/admin/request")}
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
               onClick={() => router.push("/admin/task")}
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
                           title: <div style={{ textAlign: "center" }}>Đã đóng</div>,
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
                           title: <div style={{ textAlign: "center" }}>Đã đóng</div>,
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
                        <Button type="link" size="small" onClick={() => router.push(`/admin/area/${record.areaId}`)}>
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
