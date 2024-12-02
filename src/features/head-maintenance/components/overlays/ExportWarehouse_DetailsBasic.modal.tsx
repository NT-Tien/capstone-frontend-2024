"use client"

import head_maintenance_queries from "@/features/head-maintenance/queries"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { ExportStatusMapper } from "@/lib/domain/ExportWarehouse/ExportStatus.enum"
import { ExportType } from "@/lib/domain/ExportWarehouse/ExportType.enum"
import { ExportWarehouseDto } from "@/lib/domain/ExportWarehouse/ExportWarehouse.dto"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"
import { Card, Descriptions, Divider, Image, List, Modal, ModalProps, Typography } from "antd"
import dayjs from "dayjs"
import { useEffect, useMemo, useState } from "react"

type ExportWarehouse_DetailsBasicModalProps = {
   exportWarehouse?: ExportWarehouseDto
}
type Props = Omit<ModalProps, "children"> & ExportWarehouse_DetailsBasicModalProps

function ExportWarehouse_DetailsBasicModal(props: Props) {
   const [deviceId, setDeviceId] = useState<null | string>(null)

   const api_device = head_maintenance_queries.device.one(
      {
         id: deviceId ?? "",
      },
      {
         enabled: !!deviceId,
      },
   )

   useEffect(() => {
      if (props.exportWarehouse?.export_type === ExportType.DEVICE) {
         setDeviceId(props.exportWarehouse.detail as unknown as string)
      }
   }, [props.exportWarehouse?.detail, props.exportWarehouse?.export_type, props.open])

   return (
      <Modal title="Đơn xuất kho" loading={!props.exportWarehouse} footer={null} centered {...props}>
         {props.exportWarehouse && (
            <>
               <Descriptions
                  size="small"
                  contentStyle={{
                     display: "flex",
                     justifyContent: "end",
                  }}
                  colon={false}
                  items={[
                     {
                        key: "1",
                        label: "Ngày tạo",
                        children: dayjs(props.exportWarehouse?.createdAt).format("DD/MM/YYYY HH:mm"),
                     },
                     {
                        key: "2",
                        label: "Trạng thái",
                        children: ExportStatusMapper(props.exportWarehouse.status)?.text,
                     },
                     {
                        key: "3",
                        label: "Loại xuất",
                        children: props.exportWarehouse?.export_type === ExportType.DEVICE ? "Thiết bị" : "Linh kiện",
                     },
                  ]}
               />
               {props.exportWarehouse.export_type === ExportType.SPARE_PART && (
                  <div className="mt-3">
                     <IssueSparePartsDisplay
                        issueSpareParts={(props.exportWarehouse.detail as IssueDto[]).flatMap((i) => i.issueSpareParts)}
                     />
                  </div>
               )}
               {props.exportWarehouse.export_type === ExportType.DEVICE && (
                  <>
                     <Divider />
                     {api_device.isSuccess ? (
                        <DeviceDisplay device={api_device.data} />
                     ) : (
                        <>
                           {api_device.isPending && <Card loading />}
                           {api_device.isError && <Card>Không tìm thấy thiết bị</Card>}
                        </>
                     )}
                  </>
               )}
            </>
         )}
      </Modal>
   )
}

function IssueSparePartsDisplay(props: { issueSpareParts: IssueSparePartDto[] }) {
   return (
      <Card
         className="p-0"
         classNames={{
            body: "px-0 py-1",
         }}
      >
         <List
            dataSource={props.issueSpareParts}
            size="small"
            className="text-sm"
            renderItem={(item, index) => (
               <List.Item>
                  <List.Item.Meta
                     title={<div className="text-sm">{item.sparePart.name}</div>}
                     description={<div className="text-sm">Số lượng: {item.quantity}</div>}
                  />
               </List.Item>
            )}
         />
      </Card>
   )
}

function DeviceDisplay(props: { device: DeviceDto }) {
   return (
      <>
         <Image src={props.device.machineModel.image} width="100%" alt="image" className='border-2 border-red-800 rounded-lg mb-2 h-48 object-contain' />
         <Descriptions
            size="small"
            items={[
               {
                  label: "Mẫu máy",
                  children: props.device.machineModel.name,
               },
               {
                  label: "Nhà sản xuất",
                  children: props.device.machineModel.manufacturer,
               },
               {
                  label: "Năm sản xuất",
                  children: props.device.machineModel.yearOfProduction,
               },
               {
                  label: "Mô tả",
                  children: (
                     <Typography.Paragraph ellipsis={{ rows: 2 }} className="m-0">
                        {props.device.machineModel.description}
                     </Typography.Paragraph>
                  ),
               },
            ]}
         />
      </>
   )
}

export default ExportWarehouse_DetailsBasicModal
export type { ExportWarehouse_DetailsBasicModalProps }
