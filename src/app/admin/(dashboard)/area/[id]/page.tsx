"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProDescriptions } from "@ant-design/pro-components"
import admin_queries from "@/features/admin/queries"
import dayjs from "dayjs"
import DeviceListByAreaSection from "@/features/admin/components/sections/DeviceListByArea.section"
import RequestsListByAreaSection from "@/features/admin/components/sections/RequestsListByArea.section"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Area_UpsertDrawer, { AreaUpsertDrawerProps } from "@/features/admin/components/overlays/Area_Upsert.drawer"
import { useRef } from "react"
import Dropdown from "antd/es/dropdown"
import { DeleteOutlined } from "@ant-design/icons"
import { CopyToClipboard } from "@/components/utils/CopyToClipboard"
import { cn } from "@/lib/utils/cn.util"
import { useRouter } from "next/navigation"
import admin_mutations from "@/features/admin/mutations"
import App from "antd/es/app"

function Page({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { modal } = App.useApp()

   const api_area = admin_queries.area.one({ id: params.id })

   const control_areaUpsertDrawer = useRef<RefType<AreaUpsertDrawerProps>>(null)

   const mutate_deleteArea = admin_mutations.area.delete()

   return (
      <>
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
            extra={
               <Dropdown.Button
                  type="primary"
                  onClick={() => {
                     control_areaUpsertDrawer.current?.handleOpen({ area: api_area.data })
                  }}
                  menu={{
                     items: [
                        CopyToClipboard({ value: params.id }),
                        {
                           label: "Xóa",
                           key: "delete",
                           danger: true,
                           icon: <DeleteOutlined />,
                           className: cn(api_area.data?.devices.length ? "hidden" : ""),
                           onClick: async () => {
                              modal.confirm({
                                 content: "Bạn có chắc chắn muốn xóa khu vực này?",
                                 okText: "Xóa",
                                 type: "error",
                                 closable: true,
                                 maskClosable: true,
                                 cancelText: "Hủy",
                                 okButtonProps: {
                                    danger: true,
                                 },
                                 centered: true,
                                 onOk: async () => {
                                    mutate_deleteArea.mutate(
                                       { id: params.id },
                                       {
                                          onSuccess: () => {
                                             router.push("/admin/area")
                                          },
                                       },
                                    )
                                 },
                              })
                           },
                        },
                     ],
                  }}
               >
                  Cập nhật
               </Dropdown.Button>
            }
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
         <OverlayControllerWithRef ref={control_areaUpsertDrawer}>
            <Area_UpsertDrawer
               onSuccess={async () => {
                  await api_area.refetch()
                  control_areaUpsertDrawer.current?.handleClose()
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default Page
