import head_maintenance_queries from "@/features/head-maintenance/queries"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { Button, Card, Drawer, DrawerProps, Input, Skeleton } from "antd"
import { LeftOutlined } from "@ant-design/icons"
import Image from "next/image"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import MachineModel_DetailsDrawer, {
   MachineModel_DetailsDrawerProps,
} from "@/features/head-maintenance/components/overlays/MachineModel_Details.drawer"
import { useRef } from "react"
import ClickableArea from "@/components/ClickableArea"

type PickMachineModelDrawerProps = {}
type Props = Omit<DrawerProps, "children"> & PickMachineModelDrawerProps

function PickMachineModelDrawer(props: Props) {
   const api_machineModels = head_maintenance_queries.device.all_unused(
      {},
      {
         enabled: props.open,
      },
   )

   const control_machineModelDetailsDrawer = useRef<RefType<MachineModel_DetailsDrawerProps>>(null)

   return (
      <>
         <Drawer
            title="Chọn thiết bị thay thế"
            closeIcon={<LeftOutlined />}
            loading={api_machineModels.isPending}
            placement="right"
            width="100%"
            {...props}
         >
            <Input.Search placeholder="Tìm kiếm" />
            <div className="mt-3 flex flex-col gap-2">
               {!api_machineModels.isSuccess ? (
                  <>
                     {api_machineModels.isPending && (
                        <>
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                        </>
                     )}
                     {api_machineModels.isError && <div>Đã xảy ra lỗi. Vui lòng thử lại</div>}
                  </>
               ) : (
                  api_machineModels.data
                     .filter((mm) => mm.devices.length > 0)
                     .map((mm) => (
                        <ClickableArea
                           reset
                           key={mm.id}
                           className="flex justify-start h-24 rounded-lg items-start border-2 border-neutral-300/50 bg-neutral-100"
                           onClick={() => {
                              control_machineModelDetailsDrawer.current?.handleOpen({})
                           }}
                        >
                           <Image
                              src={mm.image}
                              width={100}
                              height={100}
                              className="aspect-square h-full flex-shrink-0 rounded-l-lg"
                              alt="image"
                           />
                           <div className="p-2">
                              <h1 className="whitespace-pre-wrap">{mm.name}</h1>
                              <p>{mm.devices.length}</p>
                           </div>
                        </ClickableArea>
                     ))
               )}
            </div>
         </Drawer>
         <OverlayControllerWithRef ref={control_machineModelDetailsDrawer}>
            <MachineModel_DetailsDrawer />
         </OverlayControllerWithRef>
      </>
   )
}

function MachineModelCard(props: { machineModel: MachineModelDto }) {
   return <div></div>
}

export default PickMachineModelDrawer
export type { PickMachineModelDrawerProps }
