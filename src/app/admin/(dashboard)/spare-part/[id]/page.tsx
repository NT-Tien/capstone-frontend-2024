"use client"

import { CopyToClipboard } from "@/components/utils/CopyToClipboard"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import SparePart_UpsertDrawer, {
   SparePart_UpsertDrawerProps,
} from "@/features/admin/components/overlays/SparePart_Upsert.drawer"
import QrCodeV2Modal, { QrCodeV2ModalProps } from "@/features/admin/components/QrCodeV2.modal"
import admin_queries from "@/features/admin/queries"
import { PageContainer, ProDescriptions } from "@ant-design/pro-components"
import { Button, Dropdown } from "antd"
import dayjs from "dayjs"
import { useRef } from "react"

function Page({ params }: { params: { id: string } }) {
   const api_sparePart = admin_queries.spare_part.one({ id: params.id })

   const control_sparePartUpsertDrawer = useRef<RefType<SparePart_UpsertDrawerProps>>(null)

   const control_qrCodeV2 = useRef<RefType<QrCodeV2ModalProps> | null>(null)

   return (
      <>
         <PageContainer
            title="Thông tin linh kiện"
            breadcrumb={{
               routes: [
                  {
                     title: "Linh kiện",
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
               <div className="flex gap-2">
                  <Button
                     type="primary"
                     onClick={() => {
                        api_sparePart.isSuccess &&
                           control_qrCodeV2.current?.handleOpen({ content: api_sparePart.data.id })
                     }}
                  >
                     Xem QR Linh kiện
                  </Button>
                  <Dropdown.Button
                     type="primary"
                     menu={{
                        items: [CopyToClipboard({ value: params.id })],
                     }}
                     onClick={() =>
                        control_sparePartUpsertDrawer.current?.handleOpen({ sparePart: api_sparePart.data })
                     }
                  >
                     Cập nhật
                  </Dropdown.Button>
               </div>
            }
            content={
               <>
                  <ProDescriptions
                     dataSource={api_sparePart.data}
                     loading={api_sparePart.isPending}
                     columns={[
                        {
                           title: "Tên linh kiện",
                           dataIndex: "name",
                        },
                        {
                           title: "Số lượng",
                           dataIndex: "quantity",
                        },
                        {
                           title: "Mẫu máy",
                           dataIndex: ["machineModel", "name"],
                        },
                        {
                           title: "Ngày hết hạn",
                           dataIndex: "expirationDate",
                        },
                        {
                           title: "Ngày tạo",
                           dataIndex: "createdAt",
                           render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY HH:mm"),
                        },
                        {
                           title: "Lần cập nhật cuối",
                           render: (_, e) => dayjs(e.updatedAt).format("DD/MM/YYYY HH:mm"),
                        },
                     ]}
                  />
               </>
            }
         />
         <OverlayControllerWithRef ref={control_qrCodeV2}>
            <QrCodeV2Modal />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_sparePartUpsertDrawer}>
            <SparePart_UpsertDrawer
               onSuccess={async () => {
                  control_sparePartUpsertDrawer.current?.handleClose()
                  await api_sparePart.refetch()
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default Page
