"use client"

import { DeviceDto } from "@/common/dto/Device.dto"
import { ProDescriptions } from "@ant-design/pro-components"
import { Card, Drawer } from "antd"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { EyeOutlined, InfoCircleOutlined } from "@ant-design/icons"
import { MapPin, MapPinArea, Robot } from "@phosphor-icons/react"

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
               <div className="text-lg flex w-max items-center gap-2">
                  <Robot size={20} />
                  {t("DeviceDetails")}
               </div>
            }
         >
            <ProDescriptions
               dataSource={props.device}
               loading={props.device === undefined}
               size="small"
               columns={[
                  {
                     key: "device-warehouse",
                     title: <span className="text-lg">{t("MachineModel")}</span>,
                     render: (_, e) => <span className="text-lg">{e.machineModel?.name ?? "-"}</span>,
                  },
                  {
                     key: "device-positioning",
                     title: <span className="text-lg">{t("Position")}</span>,
                     render: (_, e) => (
                        <div className="flex items-center justify-between">
                           <span className="text-lg">
                              {e.area?.name ?? "..."} ({e.positionX}x{e.positionY})
                           </span>
                           <MapPinArea size={23} className="ml-2 text-red-500" onClick={() => setIsOpenMap(true)} />
                        </div>
                     ),
                  },
                  {
                     key: "manufacturer",
                     title: <span className="text-lg">{t("Manufacturer")}</span>,
                     render: (_, e) => <span className="text-lg">{e.machineModel?.manufacturer ?? "-"}</span>,
                  },
                  {
                     key: "year-of-production",
                     title: <span className="text-lg">{t("YearOfProduction")}</span>,
                     render: (_, e) => <span className="text-lg">{e.machineModel?.yearOfProduction ?? "-"}</span>,
                  },
                  {
                     key: "warranty-term",
                     title: <span className="text-lg">{t("warrantyTerm")}</span>,
                     render: (_, e) => <span className="text-lg">{e.machineModel?.warrantyTerm ?? "-"}</span>,
                  },
                  {
                     key: "description",
                     title: <span className="text-lg">{t("Description")}</span>,
                     render: (_, e) => <span className="text-lg">{e.machineModel?.description ?? "-"}</span>,
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
