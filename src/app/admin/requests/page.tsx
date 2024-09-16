"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProTable } from "@ant-design/pro-components"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import { App } from "antd"
import Admin_SpareParts_DeleteSoft from "@/app/admin/_api/spare-parts/delete-soft.api"
import Admin_SpareParts_Restore from "@/app/admin/_api/spare-parts/restore.api"
import CreateSparePartDrawer from "@/app/admin/spare-parts/_components/create-spare-part.drawer"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import Admin_Requests_All from "../_api/requests/all.api"
import { admin_qk } from "../_api/qk"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"

type types = {
   dto: FixRequestDto
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

export default function RequestListPage({ searchParams }: { searchParams: { area?: string } }) {
   const [query, setQuery] = useState<Partial<types["dto"]>>({})
   const actionRef = useRef()

   const response = useQuery({
      queryKey: ["requests", { page: 1, limit: 10, time: 1 }],
      queryFn: () => Admin_Requests_All({
         page: 1,
         limit: 10,
         status: FixRequestStatus.PENDING,
         time: 1,
      }),
   })

   const responseData = useMemo(() => {
      const searchArea = searchParams.area

      if(searchArea) {
         return response.data?.filter((data) => {
            return data?.device?.area?.name.includes(searchArea)
         })
      }
      return response.data
   }, [response.data, searchParams.area])

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
            search={false}
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
               },
               {
                  title: "Người báo cáo",
                  key: "machineModel",
                  render: (_, record) => record.requester?.username,
                  width: 100,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
               },
               {
                  title: "Ghi chú",
                  key: "machineModel",
                  render: (_, record) => record.requester_note,
                  width: 100,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
               },
            ]}
         />
      </PageContainer>
   )
}
