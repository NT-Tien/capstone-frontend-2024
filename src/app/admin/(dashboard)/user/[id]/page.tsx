"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProDescriptions } from "@ant-design/pro-components"
import admin_queries from "@/features/admin/queries"
import dayjs from "dayjs"
import { Role } from "@/lib/domain/User/role.enum"
import RequestsListByUserSection from "@/features/admin/components/sections/RequestsListByUser.section"
import TaskListByUserSection from "@/features/admin/components/sections/TaskListByUser.section"

function Page({ params }: { params: { id: string } }) {
   const api_user = admin_queries.user.one({ id: params.id })

   function getTabList(role?: Role) {
      if (!api_user.isSuccess) return []
      switch (role) {
         case Role.head:
            return [
               {
                  tab: "Yêu cầu",
                  children: <RequestsListByUserSection username={api_user.data.username} />,
               },
            ]
         case Role.staff:
            return [
               {
                  tab: "Tác vụ",
                  children: <TaskListByUserSection username={api_user.data.username} />,
               },
            ]
         default:
            return []
      }
   }

   return (
      <PageContainer
         title="Chi tiết tài khoản"
         breadcrumb={{
            routes: [
               {
                  title: "Tài khoản",
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
            <>
               <ProDescriptions
                  dataSource={api_user.data}
                  loading={api_user.isPending}
                  columns={[
                     {
                        title: "Tên tài khoản",
                        dataIndex: "username",
                     },
                     {
                        title: "Số điện thoại",
                        dataIndex: "phone",
                     },
                     {
                        title: "Quyền",
                        dataIndex: "role",
                     },
                     {
                        title: "Ngày tạo",
                        dataIndex: "createdAt",
                        render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY HH:mm"),
                     },
                     {
                        title: "Ngày cập nhật",
                        dataIndex: "updatedAt",
                        render: (_, e) => dayjs(e.updatedAt).format("DD/MM/YYYY HH:mm"),
                     },
                  ]}
               />
            </>
         }
         tabList={getTabList(api_user.data?.role)}
      ></PageContainer>
   )
}

export default Page
