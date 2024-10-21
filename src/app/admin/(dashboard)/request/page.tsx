"use client"

import { PageContainer } from "@ant-design/pro-layout"
import admin_queries from "@/features/admin/queries"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { FixRequest_StatusData, FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProTable } from "@ant-design/pro-components"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import dayjs from "dayjs"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import Link from "next/link"
import { AutoComplete, Card, Divider, Progress, Space, Statistic, Tag, Tooltip } from "antd"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { useQuery } from "@tanstack/react-query"
import { Role } from "@/lib/domain/User/role.enum"
import { ArrowUpOutlined, InboxOutlined } from "@ant-design/icons"

type QueryType = {
   page: number
   limit: number
   search?: {
      id?: string
      createdAt?: string[]
      updatedAt?: string[]
      requester_note?: string
      status?: any
      is_warranty?: string
      is_seen?: string
      requesterName?: string
      areaId?: string
   }
   sort?: {
      order: "ASC" | "DESC"
      orderBy: string
   }
}

function Page({ searchParams }: { searchParams: { tab?: FixRequestStatus; is_warranty?: string } }) {
   const [query, setQuery] = useState<QueryType>({
      page: 1,
      limit: 10,
      search: {
         status: searchParams.tab ?? FixRequestStatus.PENDING,
         is_warranty: searchParams.is_warranty,
         requesterName: undefined,
      },
   })

   const api_head_departments = admin_queries.user.all(
      {},
      {
         select: (data) => {
            return data.filter((user) => user.role === Role.head)
         },
      },
   )
   const api_areas = admin_queries.area.all({})

   const api_requests = admin_queries.request.all_filterAndSort({
      page: query.page,
      limit: query.limit,
      filters: {
         status: query.search?.status === "none" ? undefined : query.search?.status,
         requester_note: query.search?.requester_note,
         id: query.search?.id,
         is_warranty: query.search?.is_warranty,
         is_seen: query.search?.is_seen,
         requesterName: query.search?.requesterName,
         createdAtRangeStart: query.search?.createdAt?.[0],
         createdAtRangeEnd: query.search?.createdAt?.[1]
            ? dayjs(query.search?.createdAt?.[1]).add(1, "day").toISOString()
            : undefined,
         updatedAtRangeStart: query.search?.updatedAt?.[0],
         updatedAtRangeEnd: query.search?.updatedAt?.[1]
            ? dayjs(query.search?.updatedAt?.[1]).add(1, "day").toISOString()
            : undefined,
         areaId: query.search?.areaId,
      },
      sort: {
         order: query.sort?.order,
         orderBy: query.sort?.orderBy as any,
      },
   })

   function handleTabChange(activeKey: string) {
      setQuery((prev) => ({
         ...prev,
         page: 1,
         search: {
            ...prev.search,
            status: activeKey as FixRequestStatus,
         },
         sort: {
            order: "DESC",
            orderBy: "updatedAt",
         },
      }))
   }

   return (
      <PageContainer
         title="Danh sách Yêu cầu"
         className="custom-pagecontainer-admin"
         tabProps={{
            type: "card",
            animated: {
               tabPane: true,
               inkBar: true,
            },
            rootClassName: "mt-4",
         }}
         fixedHeader={true}
         onTabChange={handleTabChange}
         childrenContentStyle={{
            paddingTop: "2rem",
         }}
         tabActiveKey={query.search?.status}
         tabList={[
            {
               key: FixRequestStatus.PENDING,
               tab: FixRequest_StatusData("pending").text,
            },
            {
               key: FixRequestStatus.APPROVED,
               tab: FixRequest_StatusData("approved").text,
            },
            {
               key: FixRequestStatus.IN_PROGRESS,
               tab: FixRequest_StatusData("in_progress").text,
            },
            {
               key: FixRequestStatus.HEAD_CONFIRM,
               tab: FixRequest_StatusData("head_confirm").text,
            },
            {
               key: FixRequestStatus.CLOSED,
               tab: FixRequest_StatusData("closed").text,
            },
            {
               key: FixRequestStatus.HEAD_CANCEL,
               tab: FixRequest_StatusData("head_cancel").text,
            },
            {
               key: FixRequestStatus.REJECTED,
               tab: FixRequest_StatusData("rejected").text,
            },
            {
               key: "none",
               tab: "Tất cả",
            },
         ]}
      >
         <ProTable<RequestDto>
            dataSource={api_requests.data?.list}
            scroll={{ x: "max-content" }}
            loading={api_requests.isPending}
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
            onSubmit={(
               props: QueryType["search"] & {
                  requester?: {
                     username: string
                  }
                  device?: {
                     area?: {
                        name: string
                     }
                  }
               },
            ) => {
               console.log(props)
               setQuery((prev) => ({
                  ...prev,
                  search: {
                     status: prev.search?.status,
                     requesterName: props?.requester?.username,
                     areaId: props?.device?.area?.name,
                     ...props,
                  },
               }))
            }}
            onReset={() => {
               setQuery((prev) => ({
                  page: 1,
                  limit: 10,
                  search: {
                     status: prev.search?.status,
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
                  sort: {
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
               total: api_requests.data?.total ?? 0,
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
                  width: 50,
                  align: "center",
                  hideInSearch: true,
                  fixed: "left",
                  render: (value, record, index) => index + 1 + (query.page - 1) * query.limit,
               },
               {
                  title: "% Hoàn thành",
                  hideInSearch: true,
                  hideInTable: !new Set([FixRequestStatus.IN_PROGRESS]).has(query.search?.status),
                  render: (_, e) => {
                     const total = e.issues.length
                     const fixed = e.issues.filter((i) => i.status === IssueStatusEnum.RESOLVED).length
                     const failed = e.issues.filter((i) => i.status === IssueStatusEnum.FAILED).length

                     const percentFinished = Math.ceil((fixed / total) * 100)
                     const percentFailed = Math.ceil((failed / total) * 100)
                     const percentPending = Math.ceil(((total - fixed - failed) / total) * 100)

                     return (
                        <Tooltip
                           title={
                              <div className="flex flex-col">
                                 <span>Hoàn thành {percentFinished}%</span>
                                 <span>Thất bại {percentFailed}%</span>
                                 <span>Chưa thực hiện {percentPending}%</span>
                              </div>
                           }
                        >
                           <Progress
                              percent={percentFinished}
                              success={{ percent: percentFailed, strokeColor: "red" }}
                              strokeColor="green"
                              showInfo={false}
                           />
                        </Tooltip>
                     )
                  },
               },
               {
                  title: "Phân loại",
                  dataIndex: ["is_warranty"],
                  align: "center",
                  width: 100,
                  hideInTable: new Set([FixRequestStatus.PENDING, FixRequestStatus.HEAD_CANCEL]).has(
                     query.search?.status,
                  ),
                  hideInSearch: new Set([FixRequestStatus.PENDING, FixRequestStatus.HEAD_CANCEL]).has(
                     query.search?.status,
                  ),
                  render: (_, entity) =>
                     entity.is_warranty === null || entity.is_warranty === undefined ? (
                        "-"
                     ) : (
                        <Tag color={entity.is_warranty ? "blue" : "green"}>
                           {entity.is_warranty ? "Bảo hành" : "Sửa chữa"}
                        </Tag>
                     ),
                  valueType: "select",
                  valueEnum: {
                     true: { text: "Bảo hành" },
                     false: { text: "Sửa chữa" },
                  },
               },
               {
                  title: "Đã xem",
                  dataIndex: ["is_seen"],
                  valueType: "select",
                  width: 100,
                  valueEnum: {
                     true: { text: "Đã xem" },
                     false: { text: "Chưa xem" },
                  },
                  render: (_, e) => (
                     <Tag color={e.is_seen ? "green" : "default"}>{e.is_seen ? "Đã xem" : "Chưa xem"}</Tag>
                  ),
                  hideInTable: query.search?.status !== FixRequestStatus.PENDING,
                  hideInSearch: true,
               },
               {
                  title: "Thông tin yêu cầu",
                  dataIndex: ["requester_note"],
                  width: 200,
                  ellipsis: true,
                  render: (_, entity) => (
                     <Link href={`/admin/request/${entity.id}`} className="w-full truncate">
                        {entity.requester_note}
                     </Link>
                  ),
               },
               {
                  title: "Trạng thái",
                  dataIndex: ["status"],
                  width: 100,
                  hideInTable: query.search?.status !== "none",
                  hideInSearch: true,
                  render: (_, entity) => (
                     <Tag color={FixRequest_StatusMapper(entity).color}>{FixRequest_StatusMapper(entity).text}</Tag>
                  ),
               },
               {
                  title: "Mẫu thiết bị",
                  dataIndex: ["device", "machineModel", "name"],
                  width: 150,
                  ellipsis: true,
                  hideInSearch: true,
               },
               {
                  title: "Số lỗi",
                  width: 80,
                  align: "center",
                  render: (_, e) => e.issues?.length ?? 0,
                  hideInSearch: true,
                  hideInTable: !new Set([
                     FixRequestStatus.APPROVED,
                     FixRequestStatus.IN_PROGRESS,
                     FixRequestStatus.HEAD_CONFIRM,
                     FixRequestStatus.REJECTED,
                     FixRequestStatus.CLOSED,
                  ]).has(query.search?.status),
               },
               {
                  title: "Số tác vụ",
                  width: 100,
                  align: "center",
                  render: (_, e) => e.tasks?.length ?? 0,
                  hideInSearch: true,
                  hideInTable: !new Set([
                     FixRequestStatus.IN_PROGRESS,
                     FixRequestStatus.HEAD_CONFIRM,
                     FixRequestStatus.REJECTED,
                     FixRequestStatus.CLOSED,
                  ]).has(query.search?.status),
               },
               {
                  title: "Khu vực",
                  dataIndex: ["device", "area", "name"],
                  width: 100,
                  valueType: "select",
                  valueEnum: api_areas.data?.reduce((acc, area) => {
                     acc[area.id] = { text: area.name }
                     return acc
                  }, {} as any),
               },
               {
                  title: "Người tạo",
                  dataIndex: ["requester", "username"],
                  width: 125,
                  ellipsis: true,
                  valueType: "select",
                  valueEnum: api_head_departments.data?.reduce((acc, user) => {
                     acc[user.username] = { text: user.username }
                     return acc
                  }, {} as any),
               },
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  width: 200,
                  render: (_, entity) => dayjs(entity.createdAt).format("DD/MM/YYYY HH:mm"),
                  valueType: "dateRange",
                  sorter: true,
               },
               {
                  title: "Lần cập nhật cuối",
                  dataIndex: "updatedAt",
                  width: 200,
                  render: (_, entity) => dayjs(entity.updatedAt).format("DD/MM/YYYY HH:mm"),
                  sorter: true,
                  valueType: "dateRange",
                  defaultSortOrder: "descend",
               },
            ]}
         />
      </PageContainer>
   )
}

export default Page
