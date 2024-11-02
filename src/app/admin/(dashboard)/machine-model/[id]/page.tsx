"use client"

import { PageContainer } from "@ant-design/pro-layout"
import admin_queries from "@/features/admin/queries"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import DeviceListByMachineModelSection from "@/features/admin/components/sections/DeviceListByMachineModel.section"
import SparePartsListSection from "@/features/admin/components/sections/SparePartsList.section"
import TypeErrorsListSection from "@/features/admin/components/sections/TypeErrorsList.section"
import RequestsListByMachineModelSection from "@/features/admin/components/sections/RequestsListByMachineModel.section"
import Dropdown from "antd/es/dropdown"
import { CopyToClipboard } from "@/components/utils/CopyToClipboard"
import { DeleteOutlined } from "@ant-design/icons"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import MachineModel_UpsertDrawer, {
   MachineModel_UpsertDrawerProps,
} from "@/features/admin/components/overlays/MachineModel_Upsert.drawer"
import { useRef } from "react"
import { cn } from "@/lib/utils/cn.util"
import App from "antd/es/app"
import admin_mutations from "@/features/admin/mutations"
import { useRouter } from "next/navigation"

function Page({ params }: { params: { id: string } }) {
   const { modal } = App.useApp()
   const router = useRouter()
   const api_machineModel = admin_queries.machine_model.one({
      id: params.id,
   })

   const mutate_machineModelDelete = admin_mutations.machineModel.delete()

   const control_machineModelUpsertDrawer = useRef<RefType<MachineModel_UpsertDrawerProps>>(null)

   return (
      <>
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
            extra={
               <Dropdown.Button
                  type="primary"
                  menu={{
                     items: [
                        CopyToClipboard({ value: params.id }),
                        {
                           label: "Xóa",
                           key: "delete",
                           danger: true,
                           icon: <DeleteOutlined />,
                           className: cn(
                              api_machineModel.data?.devices.length ||
                                 api_machineModel.data?.spareParts.length ||
                                 api_machineModel.data?.typeErrors.length
                                 ? "hidden"
                                 : "",
                           ),
                           onClick: async () => {
                              modal.confirm({
                                 content: "Bạn có chắc chắn muốn xóa mẫu máy này?",
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
                                    mutate_machineModelDelete.mutate(
                                       { id: params.id },
                                       {
                                          onSuccess: () => {
                                             router.push("/admin/machine-model")
                                          },
                                       },
                                    )
                                 },
                              })
                           },
                        },
                     ],
                  }}
                  onClick={() =>
                     control_machineModelUpsertDrawer.current?.handleOpen({ machineModel: api_machineModel.data })
                  }
               >
                  Cập nhật
               </Dropdown.Button>
            }
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
                           title: "Lần cập nhật cuối",
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
                  children: <SparePartsListSection spareParts={api_machineModel.data?.spareParts ?? []} params={{
                     id: ""
                  }} />,
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
         <OverlayControllerWithRef ref={control_machineModelUpsertDrawer}>
            <MachineModel_UpsertDrawer
               onSuccess={async () => {
                  control_machineModelUpsertDrawer.current?.handleClose()
                  await api_machineModel.refetch()
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default Page
