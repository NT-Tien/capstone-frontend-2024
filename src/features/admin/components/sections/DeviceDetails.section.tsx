"use client"

import Card from "antd/es/card"
import { ProDescriptions } from "@ant-design/pro-components"
import { Space } from "antd"
import Button from "antd/es/button"
import { QrcodeOutlined, RightOutlined } from "@ant-design/icons"
import Link from "next/link"
import dayjs from "dayjs"
import { UseQueryResult } from "@tanstack/react-query"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import QrCodeV2Modal, { QrCodeV2ModalProps } from "@/features/admin/components/QrCodeV2.modal"
import OverlayControllerWithRef, { type RefType } from "@/components/utils/OverlayControllerWithRef"
import { useRef } from "react"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"

type Props = {
   device?: DeviceDto
   isLoading?: boolean
}

function DeviceDetailsSection({ device, isLoading }: Props) {
   const control_qrCode = useRef<RefType<QrCodeV2ModalProps>>(null)
   return (
      <>
         <Card>
            <ProDescriptions
               dataSource={device}
               loading={isLoading}
               title={device?.machineModel?.name}
               extra={
                  <Space.Compact>
                     <Button
                        icon={<QrcodeOutlined />}
                        onClick={() => device && control_qrCode.current?.handleOpen({ content: device.id })}
                     >
                        Xem QR Máy
                     </Button>
                     <Link href={`/admin/device/${device?.id}`}>
                        <Button type={"primary"} icon={<RightOutlined />} iconPosition="end">
                           Chi tiết
                        </Button>
                     </Link>
                  </Space.Compact>
               }
               bordered
               columns={[
                  {
                     title: "Nhà sản xuất",
                     dataIndex: ["machineModel", "manufacturer"],
                  },
                  {
                     title: "Năm sản xuất",
                     dataIndex: ["machineModel", "yearOfProduction"],
                  },
                  {
                     title: "Ngày nhập kho",
                     dataIndex: ["machineModel", "dateOfReceipt"],
                  },
                  {
                     title: "Mô tả",
                     dataIndex: "description",
                     span: 3,
                  },
                  {
                     title: "Bảo hành",
                     dataIndex: ["machineModel", "warrantyTerm"],
                     render: (_, entity) =>
                        entity.machineModel.warrantyTerm
                           ? dayjs(entity.machineModel.warrantyTerm).format("DD/MM/YYYY")
                           : "-",
                  },
                  {
                     title: "Khu vực",
                     dataIndex: "area",
                     render: (_, entity) => <Link href={`/admin/area/${entity.area.id}`}>{entity.area.name}</Link>,
                  },
                  {
                     title: "Vị trí",
                     render: (_, entity) => `${entity.positionX} - ${entity.positionY}`,
                  },
               ]}
            />
         </Card>
         <OverlayControllerWithRef ref={control_qrCode}>
            <QrCodeV2Modal cancelText="Đóng" okText="Tải về" onOk={(e) => {}} />
         </OverlayControllerWithRef>
      </>
   )
}

export default DeviceDetailsSection
