"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProDescriptions } from "@ant-design/pro-components"
import admin_queries from "@/features/admin/queries"
import dayjs from "dayjs"
import DeviceListByAreaSection from "@/features/admin/components/sections/DeviceListByArea.section"
import RequestsListByAreaSection from "@/features/admin/components/sections/RequestsListByArea.section"

function Page({ params }: { params: { id: string } }) {
   const api_area = admin_queries.area.one({ id: params.id })

   return (
      <PageContainer
         title="Thông tin khu vực"
         breadcrumb={{
            routes: [
               {
                  title: "Khu vực",
               },
               {
                  title: "Chi tiết",
               },
               {
                  title: params.id,
               },
            ],
         }}
         content={
            <ProDescriptions
               dataSource={api_area.data}
               loading={api_area.isPending}
               columns={[
                  {
                     title: "Tên khu vực",
                     dataIndex: "name",
                  },
                  {
                     title: "Kích thước",
                     render: (_, e) => `${e.width} x ${e.height}`,
                  },
                  {
                     title: "Mô tả",
                     dataIndex: "instruction",
                  },
                  {
                     title: "Ngày tạo",
                     dataIndex: "createdAt",
                     valueType: "date",
                     render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY HH:mm"),
                  },
                  {
                     title: "Ngày cập nhật",
                     dataIndex: "updatedAt",
                     valueType: "date",
                     render: (_, e) => dayjs(e.updatedAt).format("DD/MM/YYYY HH:mm"),
                  },
               ]}
            />
         }
         tabList={[
            {
               tab: "Danh sách thiết bị",
               children: <DeviceListByAreaSection areaId={params.id} />,
            },
            {
               tab: "Danh sách yêu cầu",
               children: <RequestsListByAreaSection areaId={params.id} />,
            },
         ]}
      ></PageContainer>
   )
}

export default Page
