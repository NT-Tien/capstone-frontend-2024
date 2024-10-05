"use client"

import { PageContainer } from "@ant-design/pro-layout"
import admin_queries from "@/features/admin/queries"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import DeviceListByMachineModelSection from "@/features/admin/components/sections/DeviceListByMachineModel.section"
import SparePartsListSection from "@/features/admin/components/sections/SparePartsList.section"
import TypeErrorsListSection from "@/features/admin/components/sections/TypeErrorsList.section"
import RequestsListByMachineModelSection from "@/features/admin/components/sections/RequestsListByMachineModel.section"

function Page({ params }: { params: { id: string } }) {
   const api_machineModel = admin_queries.machine_model.one({
      id: params.id,
   })

   return (
      <PageContainer
         title={"Chi tiết mẫu máy"}
         breadcrumb={{
            routes: [
               {
                  title: "Mẫu máy",
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
                  dataSource={api_machineModel.data}
                  loading={api_machineModel.isPending}
                  columns={[
                     {
                        title: "Tên mẫu máy",
                        dataIndex: "name",
                     },
                     {
                        title: "Nhà sản xuất",
                        dataIndex: "manufacturer",
                     },
                     {
                        title: "Năm sản xuất",
                        dataIndex: "yearOfProduction",
                     },
                     {
                        title: "Ngày nhập kho",
                        dataIndex: "dateOfReceipt",
                        render: (_, e) => (e.dateOfReceipt ? dayjs(e.dateOfReceipt).format("DD/MM/YYYY") : "-"),
                     },
                     {
                        title: "Hạn bảo hành",
                        dataIndex: "warrantyTerm",
                        render: (_, e) => (e.warrantyTerm ? dayjs(e.warrantyTerm).format("DD/MM/YYYY") : "-"),
                     },
                     {
                        title: "Mô tả",
                        dataIndex: "description",
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
         tabList={[
            {
               tab: "Thiết bị",
               key: "devices",
               children: <DeviceListByMachineModelSection machineModelId={params.id} />,
            },
            {
               tab: "Linh kiện",
               key: "spareParts",
               children: <SparePartsListSection spareParts={api_machineModel.data?.spareParts ?? []} />,
            },
            {
               tab: "Lỗi máy",
               key: "typeErrors",
               children: <TypeErrorsListSection typeErrors={api_machineModel.data?.typeErrors ?? []} />,
            },
            {
               tab: "Yêu cầu",
               key: "requests",
               children: <RequestsListByMachineModelSection machineModelId={params.id} />,
            },
         ]}
      ></PageContainer>
   )
}

export default Page
