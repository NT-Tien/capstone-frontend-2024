"use client"

import { CopyToClipboard } from "@/components/utils/CopyToClipboard"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import TypeError_UpsertDrawer, {
   TypeError_UpsertDrawerProps,
} from "@/features/admin/components/overlays/TypeError_Upsert.drawer"
import QrCodeV2Modal, { QrCodeV2ModalProps } from "@/features/admin/components/QrCodeV2.modal"
import admin_queries from "@/features/admin/queries"
import { PageContainer, ProDescriptions } from "@ant-design/pro-components"
import { Button, Dropdown } from "antd"
import dayjs from "dayjs"
import { useRef } from "react"

function Page({ params }: { params: { id: string } }) {
   const api_typeError = admin_queries.type_error.one({ id: params.id })

   const control_typeErrorUpsertDrawer = useRef<RefType<TypeError_UpsertDrawerProps>>(null)

   const control_qrCodeV2 = useRef<RefType<QrCodeV2ModalProps> | null>(null)

   return (
      <>
         <PageContainer
            title="Thông tin lỗi"
            breadcrumb={{
               routes: [
                  {
                     title: "Lỗi",
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
                        api_typeError.isSuccess &&
                           control_qrCodeV2.current?.handleOpen({ content: api_typeError.data.id })
                     }}
                  >
                     Xem QR Lỗi
                  </Button>
                  <Dropdown.Button
                     type="primary"
                     menu={{
                        items: [CopyToClipboard({ value: params.id })],
                     }}
                     onClick={() =>
                        control_typeErrorUpsertDrawer.current?.handleOpen({ typeError: api_typeError.data })
                     }
                  >
                     Cập nhật
                  </Dropdown.Button>
               </div>
            }
            content={
               <>
                  <ProDescriptions
                     dataSource={api_typeError.data}
                     loading={api_typeError.isPending}
                     columns={[
                        {
                           title: "Tên lỗi",
                           dataIndex: "name",
                        },
                        {
                           title: "Thời lượng",
                           dataIndex: "duration",
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
         <OverlayControllerWithRef ref={control_typeErrorUpsertDrawer}>
            <TypeError_UpsertDrawer
               onSuccess={async () => {
                  control_typeErrorUpsertDrawer.current?.handleClose()
                  await api_typeError.refetch()
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default Page
