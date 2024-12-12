"use client"

import { PageContainer } from "@ant-design/pro-components"
import { Button, Card, DatePicker, Divider, Space, Statistic } from "antd"
import { DoubleRightOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons"
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
            <div className="h-[180px] rounded-lg bg-white p-3">
               <h2 className="mb-2 text-lg font-semibold">
                  Yêu cầu:{" "}
                  {[
                     FixRequestStatus.PENDING,
                     FixRequestStatus.CLOSED,
                     FixRequestStatus.APPROVED,
                     FixRequestStatus.IN_PROGRESS,
                     FixRequestStatus.HEAD_CONFIRM,
                     FixRequestStatus.HEAD_CANCEL,
                     FixRequestStatus.REJECTED,
                  ].reduce((acc, status) => {
                     return acc + (api_requests.data?.[status] ?? 0)
                  }, 0)}
               </h2>
               <div className="flex h-full justify-between">
                  <div className="relative flex h-[75%] w-[65%] justify-between rounded-lg border-2 border-dashed border-black px-6 pt-5">
                     <div
                        className="h-[85%] w-[90px]"
                        onClick={() => {
                           router.push("/admin/request")
                        }}
                     >
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#cc9470] text-[40px] font-bold text-white">
                           <p>{api_requests.data?.PENDING}</p>
                        </div>
                        <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                           Chưa xử lí
                        </div>
                     </div>
                     <DoubleRightOutlined className="text-[30px]" />

                     <div
                        className="h-[85%] w-[90px]"
                        onClick={() => {
                           router.push("/admin/request?tab=APPROVED")
                        }}
                     >
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#87a556] text-[40px] font-bold text-white">
                           <p>{api_requests.data?.APPROVED}</p>
                        </div>
                        <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                           Đã xác nhận
                        </div>
                     </div>
                     <DoubleRightOutlined className="text-[30px]" />

                     <div
                        className="h-[85%] w-[90px]"
                        onClick={() => {
                           router.push("/admin/request?tab=IN_PROGRESS")
                        }}
                     >
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#5eb090] text-[40px] font-bold text-white">
                           <p>{api_requests.data?.IN_PROGRESS}</p>
                        </div>
                        <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                           Đang sửa chữa
                        </div>
                     </div>
                     <DoubleRightOutlined className="text-[30px]" />

                     <div
                        className="h-[85%] w-[90px]"
                        onClick={() => {
                           router.push("/admin/request?tab=HEAD_CONFIRM")
                        }}
                     >
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#17a56a] text-[40px] font-bold text-white">
                           <p>{api_requests.data?.HEAD_CONFIRM}</p>
                        </div>
                        <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                           Chờ đánh giá
                        </div>
                     </div>
                     <DoubleRightOutlined className="text-[30px]" />

                     <div
                        className="h-[85%] w-[90px]"
                        onClick={() => {
                           router.push("/admin/request?tab=CLOSED")
                        }}
                     >
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#069915] text-[40px] font-bold text-white">
                           <p>{api_requests.data?.CLOSED}</p>
                        </div>
                        <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                           Đã đóng
                        </div>
                     </div>
                     <div className="absolute bottom-[100px] left-1/2 flex h-[30px] w-[30%] -translate-x-1/2 transform flex-col justify-center rounded-3xl border-2 border-dashed border-black bg-[#F2DECC] text-center text-[15px]">
                        Trong quá trình xử lý
                     </div>
                  </div>

                  <div className="relative flex h-[75%] w-[30%] justify-around rounded-lg border-2 border-dashed border-black pt-5">
                     <div
                        className="h-[85%] w-[90px]"
                        onClick={() => {
                           router.push("/admin/request?tab=HEAD_CANCEL")
                        }}
                     >
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#bc9e03] text-[40px] font-bold text-white">
                           <p>{api_requests.data?.HEAD_CANCEL}</p>
                        </div>
                        <div className="relative flex h-[30%] justify-center">
                           <div className="absolute left-1/2 flex h-full w-[120%] -translate-x-1/2 transform items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Trưởng phòng sản xuất nhầm
                           </div>
                        </div>
                     </div>
                     <div
                        className="h-[85%] w-[90px]"
                        onClick={() => {
                           router.push("/admin/request?tab=HEAD_CANCEL")
                        }}
                     >
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#bc9e03] text-[40px] font-bold text-white">
                           <p>{api_requests.data?.HM_VERIFY}</p>
                        </div>
                        <div className="relative flex h-[30%] justify-center">
                           <div className="absolute left-1/2 flex h-full w-[120%] -translate-x-1/2 transform items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Cần kiểm tra lại
                           </div>
                        </div>
                     </div>

                     <div
                        className="h-[85%] w-[90px]"
                        onClick={() => {
                           router.push("/admin/request?tab=REJECTED")
                        }}
                     >
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#eba66e] text-[40px] font-bold text-white">
                           <p>{api_requests.data?.REJECTED}</p>
                        </div>
                        <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                           Đã xử lý được ngay
                        </div>
                     </div>

                     <div className="absolute bottom-[100px] left-1/2 flex h-[30px] w-[60%] -translate-x-1/2 transform flex-col justify-center rounded-3xl border-2 border-dashed border-black bg-[#Ffe4c0] text-center text-[15px]">
                        Có nhầm lẫn / sai sót
                     </div>
                  </div>
               </div>
            </div>
            <div className="mt-2 h-[365px] rounded-lg bg-white p-3">
               <h2 className="mb-4 text-lg font-semibold">
                  Tác vụ:{" "}
                  {[
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
               </h2>
               <div className="flex h-full justify-between">
                  <div className="h-[50%] w-[75%]">
                     <div className="relative flex h-[75%] w-full justify-between rounded-lg border-2 border-dashed border-black px-4 pt-5">
                        <div
                           className="h-[85%] w-[80px]"
                           onClick={() => {
                              router.push("/admin/task?tab=AWAITING_SPARE_SPART")
                           }}
                        >
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#d0b83c] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.AWAITING_SPARE_SPART}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Chờ linh kiện
                           </div>
                        </div>
                        <DoubleRightOutlined className="text-[30px]" />

                        <div
                           className="h-[85%] w-[80px]"
                           onClick={() => {
                              router.push("/admin/task?tab=AWAITING_FIXER")
                           }}
                        >
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#d7c668] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.AWAITING_FIXER}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[95%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Chưa phân công
                           </div>
                        </div>
                        <DoubleRightOutlined className="text-[30px]" />

                        <div
                           className="h-[85%] w-[80px]"
                           onClick={() => {
                              router.push("/admin/task?tab=ASSIGNED")
                           }}
                        >
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#96c256] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.ASSIGNED}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Chưa bắt đầu
                           </div>
                        </div>
                        <DoubleRightOutlined className="text-[30px]" />

                        {/* <div
                           className="h-[85%] w-[80px]"
                           onClick={() => {
                              router.push("/admin/task?tab=ASSIGNED")
                           }}
                        >
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#79be43] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.["spare-part-fetched"]}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Đã lấy linh kiện
                           </div>
                        </div>
                        <DoubleRightOutlined className="text-[30px]" /> */}

                        <div
                           className="h-[85%] w-[80px]"
                           onClick={() => {
                              router.push("/admin/task?tab=IN_PROGRESS")
                           }}
                        >
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#5ac535] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.IN_PROGRESS}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Đang thực hiện
                           </div>
                        </div>
                        <DoubleRightOutlined className="text-[30px]" />

                        <div
                           className="h-[85%] w-[80px]"
                           onClick={() => {
                              router.push("/admin/task?tab=HEAD_STAFF_CONFIRM")
                           }}
                        >
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#48b55c] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.HEAD_STAFF_CONFIRM}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Chờ kiểm tra
                           </div>
                        </div>
                        <DoubleRightOutlined className="text-[30px]" />

                        <div
                           className="h-[85%] w-[80px]"
                           onClick={() => {
                              router.push("/admin/task?tab=COMPLETED")
                           }}
                        >
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#04a723] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.COMPLETED}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Đã đóng
                           </div>
                        </div>
                        <div className="absolute bottom-[115px] left-1/2 flex h-[25px] w-[30%] -translate-x-1/2 transform flex-col justify-center rounded-3xl border-2 border-dashed border-black bg-[#F2DECC] text-center">
                           Trong quá trình xử lý
                        </div>
                     </div>

                     <div className="relative mt-8 flex h-[75%] w-full justify-between rounded-lg border-2 border-dashed border-black px-4 pt-5">
                        <div className="h-[85%] w-[80px]">
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#e9928e] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.["uninstall-device-old-already-and-move-to-stock"]}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Thu hồi thiết bị cũ
                           </div>
                        </div>

                        <div className="h-[85%] w-[80px]">
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#e9928e] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.["uninstall-device-already-and-move-to-warranty"]}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[95%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Gỡ thiết bị đi bảo hành
                           </div>
                        </div>

                        <div className="h-[85%] w-[80px]">
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#e9928e] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.["uninstall-device-waiter-already-and-move-to-stock"]}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Gỡ thiết bị tạm vào kho
                           </div>
                        </div>
                        <div className="h-[85%] w-[80px]">
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#e9928e] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.["spare-part-fetched"]}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Đã lấy linh kiện
                           </div>
                        </div>
                        <div className="h-[85%] w-[80px]">
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#e9928e] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.["install-device-warranted-already"]}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Lắp thiết bị bảo hành
                           </div>
                        </div>

                        <div className="h-[85%] w-[80px]">
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#e9928e] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.["install-device-waiter-already"]}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Lắp thiết bị tạm
                           </div>
                        </div>

                        <div className="h-[85%] w-[80px]">
                           <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#e9928e] text-[40px] font-bold text-white">
                              <p>{api_tasks.data?.["install-device-already-from-stock"]}</p>
                           </div>
                           <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Sửa thiết bị trong kho
                           </div>
                        </div>
                        <div className="absolute bottom-[115px] left-1/2 flex h-[25px] w-[30%] -translate-x-1/2 transform flex-col justify-center rounded-3xl bg-[#Ffe4c0] text-center">
                           Ngoại lệ
                        </div>
                     </div>
                  </div>
                  <div className="relative flex h-[85%] w-[24%] justify-around rounded-lg border-2 border-dashed border-black pt-5">
                     <div className="flex h-[85%] w-[90px] flex-col justify-center">
                        <div className="flex h-[35%] w-[100%] items-center justify-center rounded-lg bg-[#bc9e03] text-[40px] font-bold text-white">
                           <p>01</p>
                        </div>
                        <div className="relative flex h-[30%] justify-center">
                           <div className="absolute left-1/2 flex h-[35%] w-[90%] -translate-x-1/2 transform items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                              Đã hủy
                           </div>
                        </div>
                     </div>
                     <div className="absolute bottom-[275px] left-1/2 flex h-[30px] w-[60%] -translate-x-1/2 transform flex-col justify-center rounded-3xl bg-[#F07c5d] text-center">
                        Bị hủy
                     </div>
                  </div>
               </div>
            </div>
         </section>
      </PageContainer>
   )
}

export default Page
