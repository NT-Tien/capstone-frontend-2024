"use client"

import { PageContainer } from "@ant-design/pro-components"
import { Button, Card, DatePicker, Divider, Space, Statistic } from "antd"
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons"
import admin_queries from "@/features/admin/queries"
import { useQuery } from "@tanstack/react-query"
import Admin_Requests_Dashboard from "@/features/admin/api/request/dashboard.api"
import dayjs, { Dayjs } from "dayjs"
import Admin_Task_Dashboard from "@/features/admin/api/task/dashboard.api"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Query = {
   startDate: string
   endDate: string
}

function Page() {
   const router = useRouter()
   const [query, setQuery] = useState<Query>({
      startDate: dayjs().subtract(30, "days").toISOString(),
      endDate: dayjs().add(1, "day").toISOString(),
   })
   function handleDateChange(dates: [Dayjs | null, Dayjs | null] | null) {
      if (dates && dates[0] && dates[1]) {
         setQuery({
            startDate: dates[0].toISOString(),
            endDate: dates[1].toISOString(),
         })
      }
   }
   const [tab, setTab] = useState<string | undefined>(undefined)

   const api_requests = useQuery({
      queryKey: ["admin", "request", "dashboard", tab],
      queryFn: () =>
         Admin_Requests_Dashboard({
            type: "all",
            startDate: query.startDate,
            endDate: query.endDate,
            areaId: tab === "all" ? undefined : tab,
         }),
   })

   const api_tasks = useQuery({
      queryKey: ["admin", "task", "dashboard", tab],
      queryFn: () =>
         Admin_Task_Dashboard({
            type: "all",
            startDate: query.startDate,
            endDate: query.endDate,
            areaId: tab === "all" ? undefined : tab,
         }),
   })

   const api_areas = admin_queries.area.all(
      {},
      {
         select: (data) => {
            return data.sort((a, b) => a.name.localeCompare(b.name))
         },
      },
   )

   useEffect(() => {
      api_requests.refetch()
      api_tasks.refetch()
   }, [query.startDate, query.endDate])

   return (
      <PageContainer
         title="Thống kê"
         subTitle={`Đang hiện thông tin từ ${dayjs(query.startDate).format("DD/MM/YYYY")} đến ${dayjs(query.endDate).format("DD/MM/YYYY")}`}
         extra={
            <Space size="small">
               <DatePicker.RangePicker
                  className="w-64"
                  value={[dayjs(query.startDate), dayjs(query.endDate)]}
                  onChange={handleDateChange}
               />
               <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                     api_requests.refetch()
                     api_tasks.refetch()
                     api_areas.refetch()
                  }}
               >
                  Tải lại
               </Button>
            </Space>
         }
         tabBarExtraContent={{
            left: <div className="mr-layout font-bold">Chọn khu vực</div>,
         }}
         tabProps={{}}
         tabActiveKey={tab}
         onTabChange={(key) => setTab(key)}
         tabList={[
            {
               key: "all",
               tab: "Tất cả",
            },
            ...(api_areas.isSuccess
               ? api_areas.data.map((area) => ({
                    key: area.id,
                    tab: area.name,
                 }))
               : []),
         ]}
      >
         <section>
            <Card>
               <h2 className="text-lg font-semibold">Thống kê yêu cầu</h2>
            </Card>
            <div className="mt-3 grid grid-cols-4 gap-3">
               <Card size="small" className="w-full" onClick={() => router.push("/admin/request")}>
                  <Statistic
                     title="Tổng cộng sửa chữa"
                     value={[
                        FixRequestStatus.PENDING,
                        FixRequestStatus.CLOSED,
                        FixRequestStatus.APPROVED,
                        FixRequestStatus.IN_PROGRESS,
                        FixRequestStatus.HEAD_CONFIRM,
                     ].reduce((acc, status) => {
                        return acc + (api_requests.data?.[status] ?? 0)
                     }, 0)}
                     suffix={<span className="text-sm">yêu cầu</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full"
                  onClick={() => {
                     router.push("/admin/request")
                  }}
               >
                  <Statistic
                     title="Chưa xử lý"
                     value={api_requests.data?.PENDING}
                     suffix={<span className="text-sm">yêu cầu</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full bg-green-200"
                  onClick={() => {
                     router.push("/admin/request?tab=APPROVED")
                  }}
               >
                  <Statistic
                     title="Đã xác nhận lỗi"
                     valueStyle={{
                        color: "green",
                     }}
                     value={api_requests.data?.APPROVED}
                     suffix={<span className="text-sm">yêu cầu</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full bg-blue-200"
                  onClick={() => {
                     router.push("/admin/request?tab=IN_PROGRESS")
                  }}
               >
                  <Statistic
                     title="Đang sửa chữa"
                     valueStyle={{
                        color: "blue",
                     }}
                     value={api_requests.data?.IN_PROGRESS}
                     suffix={<span className="text-sm">yêu cầu</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full bg-yellow-200"
                  onClick={() => {
                     router.push("/admin/request?tab=HEAD_CONFIRM")
                  }}
               >
                  <Statistic
                     title="Chờ đánh giá"
                     value={api_requests.data?.HEAD_CONFIRM}
                     suffix={<span className="text-sm">yêu cầu</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full bg-purple-200"
                  onClick={() => {
                     router.push("/admin/request?tab=CLOSED")
                  }}
               >
                  <Statistic
                     valueStyle={{
                        color: "purple",
                     }}
                     title="Đã đóng"
                     value={api_requests.data?.CLOSED}
                     suffix={<span className="text-sm">yêu cầu</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full bg-red-200"
                  onClick={() => {
                     router.push("/admin/request?tab=REJECTED")
                  }}
               >
                  <Statistic
                     valueStyle={{
                        color: "red",
                     }}
                     title="Không xử lý"
                     value={api_requests.data?.REJECTED}
                     suffix={<span className="text-sm">yêu cầu</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full bg-red-200"
                  onClick={() => {
                     router.push("/admin/request?tab=HEAD_CANCEL")
                  }}
               >
                  <Statistic
                     valueStyle={{
                        color: "red",
                     }}
                     title="Trưởng phòng hủy"
                     value={api_requests.data?.HEAD_CANCEL}
                     suffix={<span className="text-sm">yêu cầu</span>}
                  />
               </Card>
            </div>
         </section>
         <section className="mt-12">
            <Card>
               <h2 className="text-lg font-semibold">Thống kê tác vụ</h2>
            </Card>
            <div className="mt-3 grid grid-cols-4 gap-3">
               <Card
                  size="small"
                  className="w-full"
                  onClick={() => {
                     router.push("/admin/task")
                  }}
               >
                  <Statistic
                     title="Tổng cộng sửa chữa"
                     value={[
                        TaskStatus.AWAITING_SPARE_SPART,
                        TaskStatus.AWAITING_FIXER,
                        TaskStatus.ASSIGNED,
                        TaskStatus.IN_PROGRESS,
                        TaskStatus.COMPLETED,
                        // TaskStatus.CANCELLED,
                        TaskStatus.HEAD_STAFF_CONFIRM,
                     ].reduce((acc, status) => {
                        return acc + (api_tasks.data?.[status] ?? 0)
                     }, 0)}
                     suffix={<span className="text-sm">Tác vụ</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full bg-orange-200"
                  onClick={() => {
                     router.push("/admin/task?tab=AWAITING_SPARE_SPART")
                  }}
               >
                  <Statistic
                     valueStyle={{
                        color: "orange",
                     }}
                     title="Chờ linh kiện"
                     value={api_tasks.data?.AWAITING_SPARE_SPART}
                     suffix={<span className="text-sm">Tác vụ</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full"
                  onClick={() => {
                     router.push("/admin/task?tab=AWAITING_FIXER")
                  }}
               >
                  <Statistic
                     title="Chưa phân công"
                     value={api_tasks.data?.AWAITING_FIXER}
                     suffix={<span className="text-sm">Tác vụ</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full bg-blue-200"
                  onClick={() => {
                     router.push("/admin/task?tab=ASSIGNED")
                  }}
               >
                  <Statistic
                     title="Chưa bắt đầu"
                     valueStyle={{
                        color: "blue",
                     }}
                     value={api_tasks.data?.ASSIGNED}
                     suffix={<span className="text-sm">Tác vụ</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full bg-purple-200"
                  onClick={() => {
                     router.push("/admin/task?tab=IN_PROGRESS")
                  }}
               >
                  <Statistic
                     valueStyle={{
                        color: "purple",
                     }}
                     title="Đang thực hiện"
                     value={api_tasks.data?.IN_PROGRESS}
                     suffix={<span className="text-sm">Tác vụ</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full bg-amber-200"
                  onClick={() => {
                     router.push("/admin/task?tab=HEAD_STAFF_CONFIRM")
                  }}
               >
                  <Statistic
                     valueStyle={
                        {
                           // color: "",
                        }
                     }
                     title="Chờ kiểm tra"
                     value={api_tasks.data?.HEAD_STAFF_CONFIRM}
                     suffix={<span className="text-sm">Tác vụ</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full bg-red-200"
                  onClick={() => {
                     router.push("/admin/task?tab=CANCELLED")
                  }}
               >
                  <Statistic
                     valueStyle={{
                        color: "red",
                     }}
                     title="Đã hủy"
                     value={api_tasks.data?.CANCELLED}
                     suffix={<span className="text-sm">Tác vụ</span>}
                  />
               </Card>
               <Card
                  size="small"
                  className="w-full bg-green-200"
                  onClick={() => {
                     router.push("/admin/task?tab=COMPLETED")
                  }}
               >
                  <Statistic
                     valueStyle={{
                        color: "green",
                     }}
                     title="Đã hoàn thành"
                     value={api_tasks.data?.COMPLETED}
                     suffix={<span className="text-sm">Tác vụ</span>}
                  />
               </Card>
            </div>
         </section>
      </PageContainer>
   )
}

export default Page
