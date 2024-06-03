"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProTable, TableDropdown } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import Users_All from "@/app/admin/_api/users/all.api"
import { Button } from "antd"
import { Role } from "@/common/enum/role.enum"
import { useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import { UserDto } from "@/common/dto/User.dto"
import CreateUserDrawer from "@/app/admin/users/_components/create-user.drawer"

export default function UsersListPage() {
   const [query, setQuery] = useState<Partial<UserDto>>({})
   const response = useQuery({
      queryKey: qk.users.all(),
      queryFn: () => Users_All(),
   })
   const actionRef = useRef()

   const responseData = useMemo(() => {
      return (
         response.data?.filter((user) => {
            let result = false
            const queryEntries = Object.entries(query)
            if (queryEntries.length === 0) return true
            for (const [key, value] of queryEntries) {
               switch (key) {
                  case "id":
                     result = result || user.id.includes(value as string)
                     break
                  case "username":
                     result = result || user.username.includes(value as string)
                     break
                  case "phone":
                     result = result || user.phone.includes(value as string)
                     break
                  case "role":
                     result = result || user.role === value
                     break
                  case "createdAt":
                     result = result || dayjs(user.createdAt).isSame(value, "day")
                     break
                  case "updatedAt":
                     result = result || dayjs(user.updatedAt).isSame(value, "day")
                     break
                  case "deletedAt":
                     result =
                        result || value === null
                           ? user.deletedAt === null
                           : dayjs(user.deletedAt).isSame(dayjs(value as string), "day")
               }
            }
            return result
         }) ?? []
      )
   }, [response.data, query])

   if (response.isError) {
      return response.error.message
   }

   return (
      <PageContainer
         title="Users List"
         subTitle={`Total ${responseData?.length ?? "..."} user(s) found.`}
         extra={
            <CreateUserDrawer>
               {(handleOpen) => (
                  <Button key="create-user-btn" type="primary" onClick={handleOpen}>
                     Create
                  </Button>
               )}
            </CreateUserDrawer>
         }
         loading={response.isLoading}
      >
         <ProTable
            actionRef={actionRef}
            dataSource={responseData ?? []}
            loading={response.isFetching}
            options={{
               reload: async () => {
                  await response.refetch()
               },
            }}
            form={{
               syncToUrl: (values, type) => {
                  if (type === "get") {
                     return {
                        ...values,
                        created_at: [values.startTime, values.endTime],
                     }
                  }
                  return values
               },
            }}
            onSubmit={(props) => {
               setQuery(props)
            }}
            onReset={() => {
               setQuery({})
            }}
            pagination={{
               pageSize: 10,
               showQuickJumper: true,
               showLessItems: true,
            }}
            columns={[
               {
                  title: "No.",
                  valueType: "indexBorder",
                  width: 48,
                  hideInSearch: true,
               },
               {
                  title: "ID",
                  dataIndex: "id",
                  hideInTable: true,
                  valueType: "text",
               },
               {
                  title: "Username",
                  dataIndex: "username",
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
                  sorter: (a, b) => a.username.localeCompare(b.username),
               },
               {
                  title: "Phone",
                  dataIndex: "phone",
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "phone",
               },
               {
                  title: "Role",
                  dataIndex: "role",
                  width: 100,
                  valueType: "select",
                  valueEnum: Role,
               },
               {
                  title: "Created At",
                  dataIndex: "createdAt",
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
               },
               {
                  title: "Updated At",
                  dataIndex: "updatedAt",
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
                  defaultSortOrder: "descend",
               },
               {
                  title: "Deleted At",
                  dataIndex: "deletedAt",
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.deletedAt ?? dayjs()).unix() - dayjs(b.deletedAt ?? dayjs()).unix(),
               },
               {
                  title: "Options",
                  valueType: "option",
                  render: (text, record, _, action) => [
                     <a
                        key="editable"
                        onClick={() => {
                           action?.startEditable?.(record.id)
                        }}
                     >
                        View/Edit
                     </a>,
                     <TableDropdown
                        key="actionGroup"
                        onSelect={() => action?.reload()}
                        menus={[{ key: "copy", name: "Copy" }]}
                     />,
                  ],
               },
            ]}
         />
      </PageContainer>
   )
}
