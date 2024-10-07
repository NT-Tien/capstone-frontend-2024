"use client"

import { PageContainer } from "@ant-design/pro-layout"
import Card from "antd/es/card"
import Button from "antd/es/button"
import { Descriptions } from "antd"
import { useQueries } from "@tanstack/react-query"
import Admin_Requests_Dashboard from "@/features/admin/api/request/dashboard.api"

function Page() {
   const api = useQueries({
      queries: [
         {
            queryKey: ["admin", "requests", "dashboard", "all"],
            queryFn: () =>
               Admin_Requests_Dashboard({
                  endDate: new Date().toISOString(),
                  startDate: "2024-09-07T02:24:40.298Z",
                  type: "all",
               }),
         },
         {
            queryKey: ["admin", "requests", "dashboard", "fix"],
            queryFn: () =>
               Admin_Requests_Dashboard({
                  endDate: new Date().toISOString(),
                  startDate: "2024-09-07T02:24:40.298Z",
                  type: "fix",
               }),
         },
         {
            queryKey: ["admin", "requests", "dashboard", "renew"],
            queryFn: () =>
               Admin_Requests_Dashboard({
                  endDate: new Date().toISOString(),
                  startDate: "2024-09-07T02:24:40.298Z",
                  type: "renew",
               }),
         },
         {
            queryKey: ["admin", "requests", "dashboard", "warranty"],
            queryFn: () =>
               Admin_Requests_Dashboard({
                  endDate: new Date().toISOString(),
                  startDate: "2024-09-07T02:24:40.298Z",
                  type: "warranty",
               }),
         },
      ],
      combine: (data) => ({
         all: data[0],
         fix: data[1],
         renew: data[2],
         warranty: data[3],
      }),
   })

   return (
      <PageContainer title="Thống kê" extra={<Button>Bộ lọc</Button>} subTitle="Thông tin trong tháng vừa qua">
         <article className="grid grid-cols-4 gap-3">
            <Card size="default" title="Tổng số yêu cầu">
               <Descriptions
                  labelStyle={{
                     flexGrow: 1,
                  }}
                  contentStyle={{
                     textAlign: "right",
                     justifyContent: "flex-end",
                  }}
                  column={1}
                  size="small"
                  items={[
                     {
                        label: "Tổng",
                        children: api.all.data ? Object.values(api.all.data).reduce((acc, cur) => acc + cur, 0) : 0,
                     },
                     {
                        label: "Chưa xử lý",
                        children: api.all.data ? api.all.data.PENDING : 0,
                     },
                     {
                        label: "Xác nhận",
                        children: api.all.data ? api.all.data.APPROVED : 0,
                     },
                     {
                        label: "Đang thực hiện",
                        children: api.all.data ? api.all.data.IN_PROGRESS : 0,
                     },
                     {
                        label: "Chờ đánh giá",
                        children: api.all.data ? api.all.data.HEAD_CONFIRM : 0,
                     },
                     {
                        label: "Đã đóng",
                        children: api.all.data ? api.all.data.CLOSED : 0,
                     },
                     {
                        label: "Không tiếp nhận",
                        children: api.all.data ? api.all.data.REJECTED : 0,
                     },
                     {
                        label: "Trưởng phòng hủy",
                        children: api.all.data ? api.all.data.HEAD_CANCEL : 0,
                     },
                  ]}
               />
            </Card>
            <Card size="default" title="Yêu cầu sửa chữa">
               <Descriptions
                  labelStyle={{
                     flexGrow: 1,
                  }}
                  contentStyle={{
                     textAlign: "right",
                     justifyContent: "flex-end",
                  }}
                  column={1}
                  size="small"
                  items={[
                     {
                        label: "Tổng",
                        children: api.fix.data ? Object.values(api.fix.data).reduce((acc, cur) => acc + cur, 0) : 0,
                     },
                     {
                        label: "Chưa xử lý",
                        children: api.fix.data ? api.fix.data.PENDING : 0,
                     },
                     {
                        label: "Xác nhận",
                        children: api.fix.data ? api.fix.data.APPROVED : 0,
                     },
                     {
                        label: "Đang thực hiện",
                        children: api.fix.data ? api.fix.data.IN_PROGRESS : 0,
                     },
                     {
                        label: "Chờ đánh giá",
                        children: api.fix.data ? api.fix.data.HEAD_CONFIRM : 0,
                     },
                     {
                        label: "Đã đóng",
                        children: api.fix.data ? api.fix.data.CLOSED : 0,
                     },
                     {
                        label: "Không tiếp nhận",
                        children: api.fix.data ? api.fix.data.REJECTED : 0,
                     },
                     {
                        label: "Trưởng phòng hủy",
                        children: api.fix.data ? api.fix.data.HEAD_CANCEL : 0,
                     },
                  ]}
               />
            </Card>
            <Card size="default" title="Yêu cầu bào hành">
               <Descriptions
                  labelStyle={{
                     flexGrow: 1,
                  }}
                  contentStyle={{
                     textAlign: "right",
                     justifyContent: "flex-end",
                  }}
                  column={1}
                  size="small"
                  items={[
                     {
                        label: "Tổng",
                        children: api.warranty.data
                           ? Object.values(api.warranty.data).reduce((acc, cur) => acc + cur, 0)
                           : 0,
                     },
                     {
                        label: "Xác nhận",
                        children: api.warranty.data ? api.warranty.data.APPROVED : 0,
                     },
                     {
                        label: "Đang thực hiện",
                        children: api.warranty.data ? api.warranty.data.IN_PROGRESS : 0,
                     },
                     {
                        label: "Chờ đánh giá",
                        children: api.warranty.data ? api.warranty.data.HEAD_CONFIRM : 0,
                     },
                     {
                        label: "Đã đóng",
                        children: api.warranty.data ? api.warranty.data.CLOSED : 0,
                     },
                     {
                        label: "Không tiếp nhận",
                        children: api.warranty.data ? api.warranty.data.REJECTED : 0,
                     },
                     {
                        label: "Trưởng phòng hủy",
                        children: api.warranty.data ? api.warranty.data.HEAD_CANCEL : 0,
                     },
                  ]}
               />
            </Card>
            <Card size="default" title="Yêu cầu thay máy">
               <Descriptions
                  labelStyle={{
                     flexGrow: 1,
                  }}
                  contentStyle={{
                     textAlign: "right",
                     justifyContent: "flex-end",
                  }}
                  column={1}
                  size="small"
                  items={[
                     {
                        label: "Tổng",
                        children: api.renew.data ? Object.values(api.renew.data).reduce((acc, cur) => acc + cur, 0) : 0,
                     },
                     {
                        label: "Xác nhận",
                        children: api.renew.data ? api.renew.data.APPROVED : 0,
                     },
                     {
                        label: "Đang thực hiện",
                        children: api.renew.data ? api.renew.data.IN_PROGRESS : 0,
                     },
                     {
                        label: "Chờ đánh giá",
                        children: api.renew.data ? api.renew.data.HEAD_CONFIRM : 0,
                     },
                     {
                        label: "Đã đóng",
                        children: api.renew.data ? api.renew.data.CLOSED : 0,
                     },
                     {
                        label: "Không tiếp nhận",
                        children: api.renew.data ? api.renew.data.REJECTED : 0,
                     },
                     {
                        label: "Trưởng phòng hủy",
                        children: api.renew.data ? api.renew.data.HEAD_CANCEL : 0,
                     },
                  ]}
               />
            </Card>
         </article>
      </PageContainer>
   )
}

export default Page
