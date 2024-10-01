"use client"

import { PageContainer } from "@ant-design/pro-layout"
import admin_queries from "@/features/admin/queries"
import { ProTable } from "@ant-design/pro-components"
import { UserDto } from "@/lib/domain/User/User.dto"
import dayjs from "dayjs"
import { useMemo, useState } from "react"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import { Role } from "@/lib/domain/User/role.enum"
import CreateUserDrawer from "@/features/admin/components/create-user.drawer"
import { Button } from "antd"
import Link from "next/link"

type QueryState = {
   page: number
   limit: number
   search?: {
      username?: string
      phone?: string
      role?: string
      createdAt?: string
      updatedAt?: string
   }
}

function Page() {
   const [query, setQuery] = useState<QueryState>({
      page: 1,
      limit: 10,
   })
   const api_users = admin_queries.user.all({})

   const filtered_api_users = useMemo(() => {
      if (!api_users.data)
         return {
            list: [],
            total: 0,
         }

      const filtered = api_users.data.filter((item) => {
         const matchUsername = query.search?.username
            ? item.username?.toLowerCase().includes(query.search.username.toLowerCase())
            : true
         const matchPhone = query.search?.phone
            ? item.phone?.toLowerCase().includes(query.search.phone.toLowerCase())
            : true
         const matchRole = query.search?.role ? item.role?.toLowerCase() === query.search.role.toLowerCase() : true
         const matchCreatedAt = query.search?.createdAt
            ? dayjs(item.createdAt).isSame(query.search.createdAt, "day")
            : true
         const matchUpdatedAt = query.search?.updatedAt
            ? dayjs(item.updatedAt).isSame(query.search.updatedAt, "day")
            : true

         return matchUsername && matchPhone && matchRole && matchCreatedAt && matchUpdatedAt
      })

      return {
         list: filtered.slice((query.page - 1) * query.limit, query.page * query.limit),
         total: filtered.length,
      }
   }, [query, api_users.data])

   return (
      <PageContainer
         title="Danh sách tài khoản"
         extra={
            <CreateUserDrawer>
               {(handleOpen) => (
                  <Button key="create-user-btn" type="primary" onClick={handleOpen}>
                     Create
                  </Button>
               )}
            </CreateUserDrawer>
         }
         // breadcrumb={{
         //    routes: [
         //       {
         //          title: "Tài khoản",
         //       },
         //       {
         //          title: "Danh sách",
         //       },
         //    ],
         // }}
      >
         <ProTable<UserDto>
            dataSource={filtered_api_users.list}
            loading={api_users.isPending}
            scroll={{ x: "max-content" }}
            search={{
               layout: "vertical",
               collapseRender: (collapsed) =>
                  collapsed ? (
                     <div className="flex items-center gap-1">
                        Mở
                        <CaretDown />
                     </div>
                  ) : (
                     <div className="flex items-center gap-1">
                        Đóng
                        <CaretUp />
                     </div>
                  ),
               searchText: "Tìm kiếm",
               resetText: "Xóa",
            }}
            onSubmit={(props: QueryState["search"]) => {
               setQuery((prev) => ({
                  ...prev,
                  page: 1,
                  search: {
                     ...props,
                  },
               }))
            }}
            onReset={() => {
               setQuery((prev) => ({
                  page: 1,
                  limit: 10,
               }))
            }}
            form={{
               syncToUrl: (values, type) => {
                  const { tab, ...newValues } = values
                  if (type === "get") {
                     return {
                        ...newValues,
                     }
                  }
                  return newValues
               },
            }}
            pagination={{
               pageSize: query.limit,
               current: query.page,
               total: filtered_api_users?.total ?? 0,
               showQuickJumper: true,
               showLessItems: true,
               onChange: (page, pageSize) => {
                  setQuery((prev) => ({
                     ...prev,
                     page,
                     limit: pageSize,
                  }))
               },
            }}
            columns={[
               {
                  title: "ID",
                  dataIndex: "id",
                  hideInTable: true,
               },
               {
                  title: "STT",
                  valueType: "indexBorder",
                  width: 40,
                  align: "center",
                  hideInSearch: true,
                  fixed: "left",
                  render: (value, record, index) => index + 1 + (query.page - 1) * query.limit,
               },
               {
                  title: "Tên tài khoản",
                  dataIndex: "username",
                  width: 200,
                  ellipsis: true,
                  render: (_, e) => <Link href={`/admin/user/${e.id}`}>{e.username}</Link>,
                  sorter: true,
                  defaultSortOrder: "descend",
               },
               {
                  title: "Số điện thoại",
                  width: 200,
                  ellipsis: true,
                  dataIndex: "phone",
               },
               {
                  title: "Quyền",
                  dataIndex: "role",
                  width: 200,
                  ellipsis: true,
                  valueType: "select",
                  valueEnum: Object.keys(Role).reduce(
                     (acc, key) => {
                        acc[key] = { text: key }
                        return acc
                     },
                     {} as {
                        [key: string]: {
                           text: string
                        }
                     },
                  ),
               },
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  width: 200,
                  render: (_, entity) => dayjs(entity.createdAt).format("DD/MM/YYYY HH:mm"),
                  valueType: "date",
                  sorter: true,
               },
               {
                  title: "Lần trước cập nhật",
                  dataIndex: "updatedAt",
                  width: 200,
                  render: (_, entity) => dayjs(entity.updatedAt).format("DD/MM/YYYY HH:mm"),
                  sorter: true,
                  valueType: "date",
               },
            ]}
         />
      </PageContainer>
   )
}

export default Page
