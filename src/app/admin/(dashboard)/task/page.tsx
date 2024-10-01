"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { useState } from "react"
import admin_queries from "@/features/admin/queries"
import { ProTable } from "@ant-design/pro-components"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import { Tag } from "antd"
import Link from "next/link"
import dayjs from "dayjs"

type QueryState = {
   page: number
   limit: number
   search: {
      status?: any
      priority?: boolean
      name?: string
      fixerDate?: string
      createdAt?: string
      updatedAt?: string
   }
   order: {
      order?: "ASC" | "DESC"
      orderBy?: string
   }
}

function Page() {
   const [query, setQuery] = useState<QueryState>({
      page: 1,
      limit: 10,
      search: {
         status: TaskStatus.AWAITING_FIXER,
      },
      order: {
         order: "DESC",
         orderBy: "updatedAt",
      },
   })

   const api_tasks = admin_queries.task.all_filterAndSort({
      page: query.page,
      limit: query.limit,
      search: {
         status: query.search?.status === "none" ? undefined : query.search?.status,
         priority: query.search?.priority,
         name: query.search?.name,
         fixerDate: query.search?.fixerDate,
      },
      order: {
         order: query.order?.order,
         orderBy: query.order?.orderBy as any,
      },
   })

   function handleTabChange(activeKey: string) {
      setQuery({
         ...query,
         page: 1,
         search: {
            status: activeKey as TaskStatus,
         },
         order: {
            order: "DESC",
            orderBy: "updatedAt",
         },
      })
   }

   return (
      <PageContainer
         title="Danh sách tác vụ"
         className="custom-pagecontainer-admin"
         onTabChange={handleTabChange}
         childrenContentStyle={{
            paddingTop: "2rem",
         }}
         // breadcrumb={{
         //    routes: [
         //       {
         //          title: "Tài khoản",
         //       },
         //       {
         //          title: "Tác vụ",
         //       },
         //    ],
         // }}
         tabProps={{
            type: "card",
            animated: {
               tabPane: true,
               inkBar: true,
            },
            rootClassName: "mt-4",
         }}
         fixedHeader={true}
         tabActiveKey={query.search?.status}
         tabList={[
            {
               key: TaskStatus.AWAITING_FIXER,
               tab: TaskStatusTagMapper[TaskStatus.AWAITING_FIXER].text,
            },
            {
               key: TaskStatus.AWAITING_SPARE_SPART,
               tab: TaskStatusTagMapper[TaskStatus.AWAITING_SPARE_SPART].text,
            },
            {
               key: TaskStatus.ASSIGNED,
               tab: TaskStatusTagMapper[TaskStatus.ASSIGNED].text,
            },
            {
               key: TaskStatus.IN_PROGRESS,
               tab: TaskStatusTagMapper[TaskStatus.IN_PROGRESS].text,
            },
            {
               key: TaskStatus.HEAD_STAFF_CONFIRM,
               tab: TaskStatusTagMapper[TaskStatus.HEAD_STAFF_CONFIRM].text,
            },
            {
               key: TaskStatus.COMPLETED,
               tab: TaskStatusTagMapper[TaskStatus.COMPLETED].text,
            },
            {
               key: TaskStatus.CANCELLED,
               tab: TaskStatusTagMapper[TaskStatus.CANCELLED].text,
            },
            {
               key: "none",
               tab: "Tất cả",
            },
         ]}
      >
         <ProTable
            dataSource={api_tasks.data?.list}
            scroll={{ x: "max-content" }}
            loading={api_tasks.isPending}
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
            onSubmit={(props: QueryState["search"]) => {
               setQuery((prev) => ({
                  ...prev,
                  search: {
                     status: prev.search?.status,
                     ...props,
                  },
               }))
            }}
            onReset={() => {
               setQuery((prev) => ({
                  page: 1,
                  limit: 10,
                  search: {
                     status: prev.search.status,
                  },
                  order: {
                     order: "DESC",
                     orderBy: "updatedAt",
                  },
               }))
            }}
            onChange={(page, filters, sorter, extra) => {
               let order, orderBy
               if (Array.isArray(sorter)) {
                  order = sorter[0].order === "descend" ? "DESC" : "ASC"
                  orderBy = sorter[0].field
               } else {
                  order = sorter.order === "descend" ? "DESC" : "ASC"
                  orderBy = sorter.field
               }

               setQuery((prev) => ({
                  ...prev,
                  order: {
                     order: order as any,
                     orderBy: orderBy as any,
                  },
               }))
            }}
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
            pagination={{
               pageSize: query.limit,
               current: query.page,
               total: api_tasks.data?.total ?? 0,
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
                  title: "Trạng thái",
                  dataIndex: ["status"],
                  width: 100,
                  hideInTable: query.search?.status !== "none",
                  hideInSearch: true,
                  align: "center",
                  render: (_, entity) => (
                     <Tag color={TaskStatusTagMapper[entity.status].color}>
                        {TaskStatusTagMapper[entity.status].text}
                     </Tag>
                  ),
               },
               // {
               //    title: "% Hoàn thành",
               //    hideInSearch: true,
               //    hideInTable: !new Set([FixRequestStatus.IN_PROGRESS]).has(query.search?.status),
               //    render: (_, e) => {
               //       const total = e.issues.length
               //       const fixed = e.issues.filter((i) => i.status === IssueStatusEnum.RESOLVED).length
               //       const failed = e.issues.filter((i) => i.status === IssueStatusEnum.FAILED).length
               //
               //       const percentFinished = Math.ceil((fixed / total) * 100)
               //       const percentFailed = Math.ceil((failed / total) * 100)
               //       const percentPending = Math.ceil(((total - fixed - failed) / total) * 100)
               //
               //       return (
               //          <Tooltip
               //             title={
               //                <div className="flex flex-col">
               //                   <span>Hoàn thành {percentFinished}%</span>
               //                   <span>Thất bại {percentFailed}%</span>
               //                   <span>Chưa thực hiện {percentPending}%</span>
               //                </div>
               //             }
               //          >
               //             <Progress
               //                percent={percentFinished}
               //                success={{ percent: percentFailed, strokeColor: "red" }}
               //                strokeColor="green"
               //                showInfo={false}
               //             />
               //          </Tooltip>
               //       )
               //    },
               // },
               {
                  title: "Tên tác vụ",
                  dataIndex: ["name"],
                  width: 200,
                  ellipsis: true,
                  render: (_, entity) => (
                     <Link href={`/admin/task/${entity.id}`} className="w-full truncate">
                        {entity.name}
                     </Link>
                  ),
                  sorter: true,
               },
               {
                  title: "Ưu tiên",
                  dataIndex: ["priority"],
                  width: 100,
                  valueType: "select",
                  align: "center",
                  valueEnum: {
                     true: "Ưu tiên",
                     false: "Không ưu tiên",
                  },
                  render: (_, entity) => (entity.priority ? <Tag color="red-inverse">Ưu tiên</Tag> : "-"),
               },
               {
                  title: "Linh kiện",
                  dataIndex: ["confirmReceipt"],
                  width: 100,
                  valueType: "select",
                  align: "center",
                  valueEnum: {
                     true: "Đã nhận",
                     false: "Chưa nhận",
                  },
                  hideInTable: query.search?.status !== TaskStatus.ASSIGNED,
                  render: (_, entity) =>
                     entity.confirmReceipt === true ? (
                        <Tag color="green-inverse">Đã nhận</Tag>
                     ) : entity.confirmReceipt === false &&
                       entity.issues?.flatMap((i: any) => i.issueSpareParts).length > 0 ? (
                        <Tag color="red-inverse">Chưa nhận</Tag>
                     ) : (
                        "-"
                     ),
               },
               {
                  title: "Thời gian thực hiện",
                  dataIndex: ["totalTime"],
                  width: 200,
                  align: "center",
                  valueType: "digit",
                  hideInSearch: true,
                  render: (_, entity) => `${entity.totalTime} phút`,
                  hideInTable: new Set([TaskStatus.AWAITING_SPARE_SPART, TaskStatus.AWAITING_FIXER]).has(
                     query.search?.status,
                  ),
                  sorter: true,
               },
               {
                  title: "Người sửa",
                  dataIndex: ["fixer", "username"],
                  width: 150,
                  hideInSearch: true,
                  hideInTable: new Set([TaskStatus.AWAITING_SPARE_SPART, TaskStatus.AWAITING_FIXER]).has(
                     query.search?.status,
                  ),
                  render: (_, entity) =>
                     entity.fixer ? (
                        <Link href={`/admin/user/${entity?.fixer?.id}`}>{entity?.fixer?.username}</Link>
                     ) : (
                        "-"
                     ),
               },
               {
                  title: "Ngày sửa chữa",
                  dataIndex: ["fixerDate"],
                  width: 160,
                  valueType: "date",
                  render: (_, entity) => (entity.fixerDate ? dayjs(entity.fixerDate).format("DD/MM/YYYY") : "-"),
                  hideInTable: new Set([TaskStatus.AWAITING_SPARE_SPART, TaskStatus.AWAITING_FIXER]).has(
                     query.search?.status,
                  ),
                  sorter: true,
               },
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  width: 200,
                  render: (_, entity) => dayjs(entity.createdAt).format("DD/MM/YYYY HH:mm"),
                  valueType: "date",
                  sorter: true,
                  hideInSearch: true,
               },
               {
                  title: "Lần trước cập nhật",
                  dataIndex: "updatedAt",
                  width: 200,
                  render: (_, entity) => dayjs(entity.updatedAt).format("DD/MM/YYYY HH:mm"),
                  sorter: true,
                  valueType: "date",
                  defaultSortOrder: "descend",
                  hideInSearch: true,
               },
            ]}
         />
      </PageContainer>
   )
}

export default Page
