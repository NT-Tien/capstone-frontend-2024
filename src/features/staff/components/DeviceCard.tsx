"use client"

import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { Gear } from "@phosphor-icons/react"
import { Card, Space, Divider } from "antd"

type Props = {
    device: DeviceDto
}

function DeviceCard(props: Props) {
   return (
      <Card size={"small"} className="mt-3 w-full bg-[#FF6B00] text-white">
         <div className={"flex items-center gap-2"}>
            <div className={"flex-grow"}>
               <Space className={"text-xs"} split={<Divider type={"vertical"} className={"m-0"} />}>
                  {props.device.machineModel.manufacturer}
                  <span>
                     Khu vực {props.device?.area?.name ?? "-"} ({props.device?.positionX ?? "-"},{" "}
                     {props.device?.positionY ?? "-"})
                  </span>
               </Space>
               <h3 className={"line-clamp-2 text-base font-semibold"}>{props.device.machineModel.name}</h3>
               {/*<div className={"text-sm"}>{props.device.description}</div>*/}
            </div>
            <div>
               <Gear size={32} weight={"fill"} />
            </div>
         </div>
      </Card>
   )
}

export default DeviceCard