"use client"

import { ReactNode, useState } from "react"
import { Button, Card, Drawer, Empty, Input, Spin } from "antd"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import { RightOutlined } from "@ant-design/icons"
import SelectSparePartDetailsDrawer, {
   FieldType,
} from "@/app/head-staff/(stack)/tasks/[id]/_components/SelectSparePartDetails.drawer"

export default function SelectSparePartDrawer(props: {
   children: (handleOpen: (deviceId: string) => void) => ReactNode
   onFinish: (values: FieldType) => void
}) {
   const [open, setOpen] = useState(false)
   const [device, setDevice] = useState<undefined | string>()

   const response = useQuery({
      queryKey: ["head-staff", ...qk.devices.one_byId(device ?? "")],
      queryFn: () => HeadStaff_Device_OneById({ id: device ?? "" }),
      enabled: !!device,
   })

   function handleOpen(deviceId: string) {
      setOpen(true)
      setDevice(deviceId)
   }

   function handleClose() {
      setOpen(false)
      setDevice(undefined)
   }

   return (
      <>
         {props.children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            placement="bottom"
            height="95%"
            title="Select Spare Part"
            className="relative"
         >
            {response.isSuccess ? (
               <>
                  {response.data.machineModel.spareParts.length === 0 && (
                     <Empty description="No spare parts for this machine have been found" />
                  )}
                  {response.data.machineModel.spareParts.length > 0 && (
                     <>
                        <Input.Search size="large" className="mb-4" placeholder="Search for Spare Parts" />
                        <SelectSparePartDetailsDrawer
                           onFinish={(values) => {
                              handleClose()
                              props.onFinish(values)
                           }}
                        >
                           {(handleOpenDetails) => (
                              <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-6">
                                 {response.data.machineModel.spareParts.map((sparePart) => (
                                    <div key={`MAIN_CONTAINER_${sparePart.id}`} className="relative">
                                       <Card
                                          key={"MAIN_" + sparePart.id}
                                          title={sparePart.name}
                                          hoverable
                                          size="small"
                                          extra={<Button type="text" size="small" icon={<RightOutlined />} />}
                                          onClick={() => handleOpenDetails(sparePart)}
                                       >
                                          <div className="flex items-center justify-between">
                                             <div className="text-xs">{sparePart.quantity} left</div>
                                             {/*<div className="text-xs">{dayjs(sparePart.createdAt).format("DD/MM/YYYY")}</div>*/}
                                          </div>
                                       </Card>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </SelectSparePartDetailsDrawer>
                     </>
                  )}
               </>
            ) : (
               <>
                  {response.isLoading && (
                     <div className="grid h-full place-items-center">
                        <Spin />
                     </div>
                  )}
                  {response.isError && <div>An error has occurred.</div>}
               </>
            )}
         </Drawer>
      </>
   )
}
