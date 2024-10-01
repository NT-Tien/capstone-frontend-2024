import { Checkbox, Divider, Drawer, DrawerProps, Empty, Radio } from "antd"
import AlertCard from "@/components/AlertCard"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { useMemo, useState } from "react"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import Card from "antd/es/card"
import Button from "antd/es/button"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { useRouter } from "next/navigation"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import App from "antd/es/app"

type RenewDeviceDrawerProps = {
   requestId?: string
   currentDevice?: DeviceDto
   request?: RequestDto
}

type Props = Omit<DrawerProps, "children"> & RenewDeviceDrawerProps

function RenewDeviceDrawer(props: Props) {
   const router = useRouter()
   const { modal } = App.useApp()

   const api_devices = head_maintenance_queries.device.all_noPosition(
      {},
      {
         enabled: props.open,
      },
   )

   const mutate_createRenewRequest = head_maintenance_mutations.request.createRenewRequest()

   const filtered_api_devices = useMemo(() => {
      if (!api_devices.isSuccess) return
      const newReturnValue: {
         current: number
         other: {
            [machineModelId: string]: {
               quantity: number
               machineModel: MachineModelDto
               deviceIds: DeviceDto[]
            }
         }
      } = {
         current: 0,
         other: {},
      }

      api_devices.data.forEach((device) => {
         if (device.machineModel.id === props.currentDevice?.machineModel.id) {
            newReturnValue.current++
         } else {
            if (!newReturnValue.other[device.machineModel.id]) {
               newReturnValue.other[device.machineModel.id] = {
                  quantity: 0,
                  machineModel: device.machineModel,
                  deviceIds: [],
               }
            }
            newReturnValue.other[device.machineModel.id].quantity++
            const { machineModel, ...newDevice } = device
            newReturnValue.other[device.machineModel.id].deviceIds.push(newDevice as any)
         }
      })

      return {
         current: newReturnValue.current,
         other: Object.values(newReturnValue.other).sort((a, b) => b.quantity - a.quantity),
      }
   }, [api_devices.data, api_devices.isSuccess, props.currentDevice?.machineModel.id])

   const [selectedDevice, setSelectedDevice] = useState<DeviceDto | null>(null)

   function handleSubmit() {
      modal.confirm({
         title: "Xác nhận thay máy",
         content: `Bạn có chắc chắn muốn thay máy mới cho yêu cầu này không?`,
         onOk: () => {
            if (!props.requestId || !props.request || !selectedDevice) return
            mutate_createRenewRequest.mutate(
               {
                  requestId: props.requestId,
                  request: props.request,
                  selectedDeviceId: selectedDevice.id,
               },
               {
                  onSuccess: () => {
                     router.push(`/head-staff/mobile/requests/${props.requestId}/approved`)
                  },
               },
            )
         },
         okText: "Xác nhận",
         cancelText: "Hủy",
         closable: true,
         centered: true,
         maskClosable: true,
      })
   }

   return (
      <Drawer
         title="Thay máy mới"
         placement="right"
         width="100%"
         classNames={{
            footer: "p-layout",
         }}
         footer={
            <Button type="primary" size="large" block disabled={!selectedDevice} onClick={handleSubmit}>
               Xác nhận thay máy
            </Button>
         }
         {...props}
      >
         <AlertCard text="Vui lòng chọn thiết bị mới để thay thế" type="info" />
         <article className="mt-3">
            <section className="flex flex-col gap-1">
               {filtered_api_devices?.current === 0 ? (
                  <Card>
                     <Empty description="Không có thiết bị nào cùng loại" />
                  </Card>
               ) : (
                  <Card
                     key={"current_device"}
                     hoverable
                     size="small"
                     onClick={() => setSelectedDevice(props.currentDevice ?? null)}
                     className={`${selectedDevice?.id === props.currentDevice?.id ? "border border-primary" : ""}`}
                  >
                     <div className="flex">
                        <Radio checked={props.currentDevice?.id === selectedDevice?.id} />
                        <section>
                           <h3 className="font-semibold">{props.currentDevice?.machineModel.name}</h3>
                           <div className="flex w-full items-center justify-between">
                              <p className="text-sm">{props.currentDevice?.machineModel.manufacturer}</p>
                              <p className="text-sm">{filtered_api_devices?.current} trong kho</p>
                           </div>
                        </section>
                     </div>
                  </Card>
               )}
               <Divider className="my-2">Thiết bị khác</Divider>
               {filtered_api_devices?.other.map((item) => (
                  <Card
                     key={item.machineModel.id}
                     hoverable
                     size="small"
                     onClick={() => setSelectedDevice(item.deviceIds[0])}
                     className={`${selectedDevice?.id === item.deviceIds[0].id ? "border border-primary" : ""}`}
                  >
                     <div className="flex items-start gap-3">
                        <Radio checked={item.deviceIds[0].id === selectedDevice?.id} />
                        <section className="w-full">
                           <h3 className="font-semibold">{item.machineModel.name}</h3>
                           <div className="flex w-full items-center justify-between">
                              <p className="text-sm">{item.machineModel.manufacturer}</p>
                              <p className="text-sm">{item.quantity} trong kho</p>
                           </div>
                        </section>
                     </div>
                  </Card>
               ))}
            </section>
         </article>
      </Drawer>
   )
}

export default RenewDeviceDrawer
export type { RenewDeviceDrawerProps }
