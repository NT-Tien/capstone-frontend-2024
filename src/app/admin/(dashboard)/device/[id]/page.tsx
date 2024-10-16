"use client"

import admin_queries from "@/features/admin/queries"
import { PageContainer } from "@ant-design/pro-layout"
import { ProDescriptions } from "@ant-design/pro-components"
import Link from "next/link"
import RequestsListByDeviceSection from "@/features/admin/components/sections/RequestsListByDevice.section"
import Button from "antd/es/button"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import QrCodeV2Modal, { QrCodeV2ModalProps } from "@/features/admin/components/QrCodeV2.modal"
import { useRef } from "react"

function Page({ params }: { params: { id: string } }) {
   const api_device = admin_queries.device.one({ id: params.id })

   const control_qrCodeV2 = useRef<RefType<QrCodeV2ModalProps> | null>(null)

   return (
      <>
         <PageContainer
            title="Thông tin thiết bị"
            breadcrumb={{
               routes: [
                  {
                     title: "Thiết bị",
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
               <Button
                  type="primary"
                  onClick={() => {
                     api_device.isSuccess && control_qrCodeV2.current?.handleOpen({ content: api_device.data.id })
                  }}
               >
                  Xem QR Máy
               </Button>
            }
            content={
               <>
                  <ProDescriptions
                     dataSource={api_device.data}
                     loading={api_device.isPending}
                     columns={[
                        {
                           title: "Tên Mẫu máy",
                           dataIndex: ["machineModel", "name"],
                        },
                        {
                           title: "Khu vực",
                           dataIndex: ["area", "name"],
                           render: (_, e) => <Link href={`/admin/area/${e.area.id}`}>{e.area.name}</Link>,
                        },
                        {
                           title: "Vị trí",
                           dataIndex: "position",
                           render: (_, e) =>
                              !e.positionX || !e.positionY ? "Chưa xác định" : `${e.positionX} - ${e.positionY}`,
                        },
                        {
                           title: "Mô tả",
                           dataIndex: "description",
                           span: 3,
                        },
                     ]}
                  />
               </>
            }
            tabList={[
               {
                  tab: "Yêu cầu",
                  key: "requests",
                  children: <RequestsListByDeviceSection deviceId={params.id} />,
               },
            ]}
         />
         <OverlayControllerWithRef ref={control_qrCodeV2}>
            <QrCodeV2Modal />
         </OverlayControllerWithRef>
      </>
   )
}

export default Page
