"use client"

import AlertCard from "@/components/AlertCard"
import { Button, Drawer, DrawerProps, QRCode } from "antd"

type Issue_Resolve_ReturnWarehouseDrawerProps = {
   taskId?: string
}
type Props = Omit<DrawerProps, "children"> & Issue_Resolve_ReturnWarehouseDrawerProps

function Issue_Resolve_ReturnWarehouseDrawer(props: Props) {
   return (
      <Drawer
         title="Hoàn thành bước"
         placement="bottom"
         height="max-content"
         classNames={{
            footer: "p-layout pt-0 border-none",
         }}
         loading={!props.taskId}
         footer={
            <Button onClick={props.onClose} block>
               Đóng
            </Button>
         }
         {...props}
      >
         <AlertCard text="Vui lòng đưa mã QR sau cho thủ kho và ký xác nhận trên thiết bị thủ kho" type="info" />
         <div className="mt-3 aspect-square w-full">
            {props.taskId && (
               <QRCode
                  value={props.taskId}
                  className="h-full w-full"
                  onClick={() => {
                     navigator.clipboard.writeText(props.taskId ?? "")
                  }}
               />
            )}
         </div>
      </Drawer>
   )
}

export default Issue_Resolve_ReturnWarehouseDrawer
export type { Issue_Resolve_ReturnWarehouseDrawerProps }
