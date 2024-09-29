"use client"

import admin_queries from "@/features/admin/queries"
import { useState } from "react"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { Progress, Tag, Tooltip } from "antd"
import Link from "next/link"
import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import dayjs from "dayjs"
import { ProTable } from "@ant-design/pro-components"

type Props = {
   username: string
}

type QueryType = {
   page: number
   limit: number
   search?: {
      id?: string
      createdAt?: string
      updatedAt?: string
      requester_note?: string
      status?: FixRequestStatus
      is_warranty?: string
   }
   sort?: {
      order: "ASC" | "DESC"
      orderBy: string
   }
}

function RequestsListByUserSection(props: Props) {
   const [query, setQuery] = useState<QueryType>({
      page: 1,
      limit: 10,
   })

   const api_requests = admin_queries.request.all_filterAndSort({
      page: query.page,
      limit: query.limit,
      filters: {
         status: query.search?.status === "none" ? undefined : query.search?.status,
         createdAt: query.search?.createdAt,
         updatedAt: query.search?.updatedAt,
         requester_note: query.search?.requester_note,
         id: query.search?.id,
         is_warranty: query.search?.is_warranty,
         requesterName: props.username,
      },
      sort: {
         order: query.sort?.order,
         orderBy: query.sort?.orderBy as any,
      },
   })

   return (
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
         onSubmit={(props: QueryType["search"]) => {
            setQuery((prev) => ({
               ...prev,
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
               width: 40,
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
               hideInTable: new Set([FixRequestStatus.PENDING, FixRequestStatus.HEAD_CANCEL]).has(query.search?.status),
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
               render: (_, entity) => (
                  <Tag color={FixRequest_StatusMapper(entity).color}>{FixRequest_StatusMapper(entity).text}</Tag>
               ),
               valueType: "select",
               valueEnum: Object.keys(FixRequestStatus).reduce((acc, key) => {
                  acc[key] = { text: FixRequest_StatusMapper({ status: key as FixRequestStatus }).text }
                  return acc
               }, {}),
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
               hideInSearch: true,
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
               defaultSortOrder: "descend",
            },
         ]}
      />
   )
}

export default RequestsListByUserSection
