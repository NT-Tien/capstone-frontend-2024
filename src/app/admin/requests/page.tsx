"use client"
import { PageContainer } from "@ant-design/pro-layout"
import { ProTable } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import Admin_SpareParts_DeleteSoft from "@/app/admin/_api/spare-parts/delete-soft.api"
import Admin_SpareParts_Restore from "@/app/admin/_api/spare-parts/restore.api"
import CreateSparePartDrawer from "@/app/admin/spare-parts/_components/create-spare-part.drawer"
import Admin_Requests_All from "../_api/requests/all.api"
import { admin_qk } from "../_api/qk"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

type QueryState = {
   machineModel?: string
   area?: string
   requesterName?: string
   status?: FixRequestStatus
   createdAt?: string
}

const values = {
   nameSingle: "yêu cầu",
   nameSingleCapitalized: "Yêu cầu",
   mainQueryFn: Admin_Requests_All,
   mainQueryKey: admin_qk.requests.all,
   deleteMutationFn: Admin_SpareParts_DeleteSoft,
   restoreMutationFn: Admin_SpareParts_Restore,
   CreateDrawer: CreateSparePartDrawer,
   detailsHref: (page: number, limit: number, status: string, time: number) =>
      `/admin/request/${page}/${limit}/${status}?time=${time}`,
}

export default function RequestListPage() {
   const actionRef = useRef()
   const [query, setQuery] = useState<QueryState>({})

   const response = useQuery({
      queryKey: ["requests", { page: 1, limit: 10, time: 1 }],
      queryFn: () =>
         Admin_Requests_All({
            page: 1,
            limit: 10,
            status: FixRequestStatus.PENDING,
            time: 1,
         }),
   })

   const responseData = useMemo(() => {
      if (!response.data) return []

      return response.data.filter((item) => {
         const matchMachineModel = query.machineModel
            ? item.device.machineModel.name.toLowerCase().includes(query.machineModel.toLowerCase())
            : true
         const matchArea = query.area ? item.device.area.name.toLowerCase().includes(query.area.toLowerCase()) : true
         const matchRequesterName = query.requesterName
            ? item.requester?.username.toLowerCase().includes(query.requesterName.toLowerCase())
            : true
         const matchStatus = query.status ? item.status === query.status : true
         const matchCreatedAt = query.createdAt ? dayjs(item.createdAt).isSame(query.createdAt, "day") : true

         return matchMachineModel && matchArea && matchRequesterName && matchStatus && matchCreatedAt
      })
   }, [response.data, query])

   if (response.isError) {
      return response.error.message
   }

   return (
      <PageContainer
         title={`Danh sách ${values.nameSingle}`}
         subTitle={`Tổng cộng ${responseData?.length ?? "..."} ${values.nameSingle} đã được tìm thấy.`}
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
            virtual
            form={{
               syncToUrl: (values, type) => {
                  if (type === "get") {
                     return {
                        ...values,
                     }
                  }
                  return values
               },
            }}
            onSubmit={(values) => {
               setQuery({
                  ...values,
                  machineModel: values.machineModel || "",
                  area: values.area || "",
                  requesterName: values.requesterName || "",
               })
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
                  title: "STT",
                  valueType: "indexBorder",
                  width: 40,
                  hideInSearch: true,
               },
               {
                  title: "ID",
                  dataIndex: "id",
                  hideInTable: true,
                  valueType: "text",
                  hideInSearch: true,
               },
               {
                  title: "Tên thiết bị",
                  key: "machineModel",
                  render: (_, record) => record.device.machineModel.name,
                  width: 150,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
                  dataIndex: ["device", "machineModel", "name"],
                  search: true,
               },
               {
                  title: "Khu vực",
                  key: "area",
                  render: (_, record) => record.device.area.name,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
                  width: 60,
                  dataIndex: ["device", "area", "name"],
                  search: true,
               },
               {
                  title: "Trạng thái",
                  dataIndex: "status",
                  width: 60,
                  valueType: "text",
               },
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  valueType: "date",
                  sorter: (a, b) =>
                     dayjs(a.createdAt).add(7, "hours").unix() - dayjs(b.createdAt).add(7, "hours").unix(),
                  width: 100,
               },
               {
                  title: "Ngày cập nhật",
                  dataIndex: "updatedAt",
                  valueType: "date",
                  sorter: (a, b) =>
                     dayjs(a.updatedAt).add(7, "hours").unix() - dayjs(b.updatedAt).add(7, "hours").unix(),
                  defaultSortOrder: "descend",
                  width: 100,
                  hideInSearch: true,
               },
               {
                  title: "Người báo cáo",
                  key: "requesterName",
                  render: (_, record) => record.requester?.username,
                  width: 100,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
                  dataIndex: ["requester", "username"],
                  search: true,
               },
               {
                  title: "Ghi chú",
                  key: "note",
                  render: (_, record) => record.requester_note,
                  width: 100,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
                  hideInSearch: true,
               },
            ]}
         />
      </PageContainer>
   )
}
