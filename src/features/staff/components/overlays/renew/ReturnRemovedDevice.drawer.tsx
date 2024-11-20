"use client"

import AlertCard from "@/components/AlertCard"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { Button, Checkbox, Drawer, DrawerProps, QRCode } from "antd"
import { useState } from "react"

type ReturnRemovedDeviceProps = {
   task?: TaskDto
   returnDevice?: DeviceDto[]
   onFinish?: () => void
}
type Props = Omit<DrawerProps, "children"> & ReturnRemovedDeviceProps

function ReturnRemovedDevice(props: Props) {
   const [signed, setSigned] = useState<boolean>(false)
   return (
      <Drawer
         title="Trả thiết bị"
         classNames={{ footer: "p-layout" }}
         placement="bottom"
         height="100%"
         footer={
            <div>
               <div className="mb-3 flex items-start gap-3">
                  <Checkbox id="sign" checked={signed} onChange={(e) => setSigned(e.target.checked)} />
                  <label htmlFor="sign" className={"font-bold"}>
                     Tôi đã ký xác nhận
                  </label>
               </div>
               <Button block disabled={!signed} type="primary" size="large" onClick={props.onFinish}>
                  Hoàn tất
               </Button>
            </div>
         }
         {...props}
      >
         <AlertCard text="Vui lòng xuống kho để trả thiết bị" type="info" className="mb-layout" />
         {props.task && (
            <section>
               <QRCode value={props.task.id} className="aspect-square h-max w-full" />
               <section className="mt-layout">
                  <h3
                     className="mb-1 text-lg font-semibold"
                     onClick={() => {
                        props.task && window.navigator.clipboard.writeText(props.task.id)
                     }}
                  >
                     Thiết bị cần trả
                  </h3>
                  <div className="h-32 overflow-y-auto rounded-lg bg-neutral-200 p-2">
                     <div className="flex items-center justify-between">
                        <h3>{props.task.device.machineModel.name} - {props.task.device.description}</h3>
                     </div>
                  </div>
               </section>
            </section>
         )}
      </Drawer>
   )
}

export default ReturnRemovedDevice
export type { ReturnRemovedDeviceProps }
