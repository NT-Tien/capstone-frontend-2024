"use client"

import { forwardRef, ReactNode, useEffect, useImperativeHandle, useState } from "react"
import { Button, Card, Drawer, DrawerProps, Empty, Form, Input, InputNumber, Spin } from "antd"
import { useQuery } from "@tanstack/react-query"
import HeadStaff_Device_OneById from "@/features/head-maintenance/api/device/one-byId.api"
import { cn } from "@/lib/utils/cn.util"
import headstaff_qk from "@/features/head-maintenance/qk"
import ProCard from "@ant-design/pro-card"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { MinusOutlined, PlusOutlined } from "@ant-design/icons"
import { useModalStack } from "@/providers/ModalStack.provider"
import useModalControls from "@/lib/hooks/useModalControls"

type ReturnType = {
   sparePartId: string
   quantity: number
}

export type SelectSparePartDrawerRefType = {
   openDrawer: (deviceId: string, ignoreIdList?: string[]) => void
}

type Props = {
   children: (handleOpen: (deviceId: string, ignoreIdList?: string[]) => void) => ReactNode
   onFinish: (values: ReturnType) => Promise<void>
   drawerProps?: DrawerProps
}

const SelectSparePartDrawer = forwardRef<SelectSparePartDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (deviceId: string, ignoreIdList?: string[]) => {
         setDeviceId(deviceId)
         setIgnoreIdList(ignoreIdList ?? [])
      },
      onClose: () => {
         setDeviceId(undefined)
         setIgnoreIdList([])
         setSelectedSparePart(undefined)
         setQuantity(1)
         setSearchTerm("")
      },
   })

   const [deviceId, setDeviceId] = useState<undefined | string>()
   const [ignoreIdList, setIgnoreIdList] = useState<string[]>([])
   const [selectedSparePart, setSelectedSparePart] = useState<SparePartDto | undefined>()
   const [quantity, setQuantity] = useState(1)
   const [searchTerm, setSearchTerm] = useState("")

   const response = useQuery({
      queryKey: headstaff_qk.device.byId(deviceId ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: deviceId ?? "" }),
      enabled: !!deviceId,
      select: (data) =>
         !!ignoreIdList
            ? data.machineModel.spareParts.filter((sp) => !ignoreIdList.includes(sp.id))
            : data.machineModel.spareParts,
   })
   const filteredSpareParts =
      response.data?.filter((sparePart) => sparePart.name.toLowerCase().includes(searchTerm.toLowerCase())) || []

   useImperativeHandle(
      ref,
      () => ({
         openDrawer: handleOpen,
      }),
      [handleOpen],
   )

   return (
      <>
         {props.children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            placement="bottom"
            height="95%"
            title="Linh kiện thay thế"
            className="relative"
            classNames={{
               body: "p-0",
            }}
            {...props.drawerProps}
         >
            {response.isSuccess ? (
               <>
                  {response.data.length === 0 ? (
                     <Empty
                        className="grid h-full place-content-center px-3"
                        description="No spare parts for this machine have been found"
                     />
                  ) : (
                     <div className="grid h-full grid-cols-1">
                        <Input.Search
                           size="large"
                           className="my-3 px-3"
                           placeholder="Tìm kiếm linh kiện"
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <section
                           className="flex flex-col gap-2 overflow-y-auto px-3 pb-4"
                           style={{
                              gridRow: "span 100",
                           }}
                        >
                           {filteredSpareParts.map((sparePart, index) => (
                              <ProCard
                                 key={sparePart.id}
                                 size="small"
                                 hoverable
                                 onClick={() => {
                                    setSelectedSparePart(sparePart)
                                    setQuantity(1)
                                 }}
                                 className={cn(
                                    index % 2 === 0 ? "bg-neutral-200/50" : "bg-neutral-50",
                                    sparePart.id === selectedSparePart?.id &&
                                       "border-l-[6px] border-primary-500 bg-primary-50",
                                 )}
                                 bordered
                              >
                                 <div className="flex flex-col">
                                    <span className="text-base font-semibold">{sparePart.name}</span>
                                    <span>Số lượng: {sparePart.quantity}</span>
                                 </div>
                              </ProCard>
                           ))}
                        </section>
                        {selectedSparePart !== undefined && (
                           <section className="flex w-full flex-col gap-5 border-t-2 border-t-neutral-200 bg-white px-3 pb-3 pt-5 shadow-fb">
                              <div className="flex-grow">
                                 <ProCard size="small" className="bg-neutral-100" bordered>
                                    <div className="flex items-center">
                                       <div className="flex flex-grow flex-col">
                                          <span className="text-xl font-semibold">{selectedSparePart.name}</span>
                                          <span>Số lượng: {selectedSparePart.quantity}</span>
                                       </div>
                                       <div className="flex items-center gap-1">
                                          <Button
                                             icon={<MinusOutlined />}
                                             onClick={() => setQuantity((prev) => (prev - 1 > 0 ? prev - 1 : 1))}
                                          />
                                          <InputNumber
                                             className="w-12 text-center"
                                             value={quantity}
                                             controls={false}
                                             onChange={(number) => {
                                                let num = number
                                                if (!num) num = 1
                                                if (num > selectedSparePart.quantity) num = selectedSparePart.quantity
                                                if (num < 1) num = 1
                                                setQuantity(num)
                                             }}
                                          />
                                          <Button
                                             icon={<PlusOutlined />}
                                             onClick={() =>
                                                setQuantity((prev) =>
                                                   prev + 1 > selectedSparePart.quantity
                                                      ? selectedSparePart.quantity
                                                      : prev + 1,
                                                )
                                             }
                                          />
                                       </div>
                                    </div>
                                 </ProCard>
                              </div>
                              <Button
                                 icon={<PlusOutlined />}
                                 type="primary"
                                 className="w-full"
                                 size="large"
                                 onClick={async () => {
                                    props
                                       .onFinish({
                                          sparePartId: selectedSparePart.id,
                                          quantity,
                                       })
                                       .then(() => {
                                          handleClose()
                                       })
                                 }}
                              >
                                 Thêm linh kiện
                              </Button>
                           </section>
                        )}
                     </div>
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
})

export default SelectSparePartDrawer
