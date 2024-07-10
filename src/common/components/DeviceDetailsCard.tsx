"use client"

import { DeviceDto } from "@/common/dto/Device.dto"
import { ProDescriptions } from "@ant-design/pro-components"
import { Card, Drawer } from "antd"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { EyeOutlined, InfoCircleOutlined } from "@ant-design/icons"
import { Robot } from "@phosphor-icons/react"

type Props = {
   device?: DeviceDto
   className?: string
}

export default function DeviceDetailsCard(props: Props) {
   const { t } = useTranslation()
   const [isOpenMap, setIsOpenMap] = useState(false)
   const [isOpenDetails, setIsOpenDetails] = useState(false)

   return (
      <>
         <Card
            className={props.className}
            size="small"
            title={
               <div className="flex w-max items-center gap-2">
                  <Robot size={16} />
                  {t("DeviceDetails")}
               </div>
            }
            actions={[
               <a key={"view"} className="inline-flex w-max items-center gap-2" onClick={() => setIsOpenMap(true)}>
                  <EyeOutlined />
                  View on Map
               </a>,
               <a key="details" className="inline-flex w-max items-center gap-2" onClick={() => setIsOpenDetails(true)}>
                  <InfoCircleOutlined />
                  Details
               </a>,
            ]}
         >
            <ProDescriptions
               dataSource={props.device}
               loading={props.device === undefined}
               size="small"
               columns={[
                  {
                     key: "device-machine-model",
                     title: t("MachineModel"),
                     render: (_, e) => e.machineModel?.name ?? "-",
                  },
                  {
                     key: "device-positioning",
                     title: t("Position"),
                     render: (_, e) => `${e.area?.name ?? "..."} (${e.positionX}x${e.positionY})`,
                  },
                  {
                     key: "manufacturer",
                     title: t("Manufacturer"),
                     render: (_, e) => e.machineModel?.manufacturer ?? "-",
                  },
               ]}
            />
         </Card>
         <Drawer title="Device Details" open={isOpenDetails} onClose={() => setIsOpenDetails(false)} placement="bottom">
            Device Details placeholder
         </Drawer>
         <Drawer title="Device Position" open={isOpenMap} onClose={() => setIsOpenMap(false)} placement="bottom">
            Device Map placeholder
         </Drawer>
      </>
   )
}
