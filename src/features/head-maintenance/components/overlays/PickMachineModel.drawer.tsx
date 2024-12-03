import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import MachineModel_DetailsDrawer, {
   MachineModel_DetailsDrawerProps,
} from "@/features/head-maintenance/components/overlays/MachineModel_Details.drawer"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { cn } from "@/lib/utils/cn.util"
import { LeftOutlined, SearchOutlined } from "@ant-design/icons"
import { DeviceTablet, Factory } from "@phosphor-icons/react"
import { Card, Divider, Drawer, DrawerProps, Empty, Input, Skeleton, Space } from "antd"
import Image from "next/image"
import { useMemo, useRef, useState } from "react"

type PickMachineModelDrawerProps = {
   onSubmit?: (machineModel: MachineModelDto) => void
}
type Props = Omit<DrawerProps, "children"> & PickMachineModelDrawerProps

function PickMachineModelDrawer(props: Props) {
   const api_machineModels = head_maintenance_queries.device.all_unused(
      {},
      {
         enabled: props.open,
      },
   )
   const [search, setSearch] = useState<string>("")

   const control_machineModelDetailsDrawer = useRef<RefType<MachineModel_DetailsDrawerProps>>(null)

   const renderList = useMemo(() => {
      if (!api_machineModels.isSuccess) return

      let list = api_machineModels.data

      list = list.filter((mm) => mm.devices.length > 0)

      if (search) {
         list = list.filter((mm) => mm.name.toLowerCase().includes(search.toLowerCase()))
      }

      return list
   }, [api_machineModels.data, api_machineModels.isSuccess, search])

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
            <Input
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               addonBefore={<SearchOutlined />}
               placeholder="Tìm kiếm mẫu máy"
               size="large"
            />
            <div className="mt-5 grid grid-cols-2 gap-2">
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
                     {api_machineModels.isError && <Card className="col-span-2">Đã xảy ra lỗi. Vui lòng thử lại</Card>}
                  </>
               ) : renderList!.length > 0 ? (
                  renderList?.map((mm) => (
                     <Card
                        key={mm.id}
                        cover={
                           <Image
                              src={mm.image}
                              alt={mm.name}
                              className="h-32 w-full rounded-t-lg object-cover"
                              width={200}
                              height={200}
                           />
                        }
                        className={cn(
                           "relative w-full rounded-lg border-[1px] border-neutral-200 bg-neutral-100",
                           // selectedMachineModel?.id === mm.id && "bg-red-200",
                        )}
                        classNames={{
                           body: "px-2 py-4",
                        }}
                        onClick={() => {
                           control_machineModelDetailsDrawer.current?.handleOpen({
                              machineModel: mm,
                           })
                        }}
                     >
                        <Card.Meta
                           title={<h3 className="truncate text-sm">{mm.name}</h3>}
                           description={
                              <Space split={<Divider type="vertical" className="m-0" />} wrap className="text-xs">
                                 <div className="flex items-center gap-1">
                                    <DeviceTablet size={16} weight="duotone" />
                                    {mm.devices.length}
                                 </div>
                                 <div className="flex items-center gap-1">
                                    <Factory size={16} weight="duotone" />
                                    {mm.manufacturer}
                                 </div>
                              </Space>
                           }
                        />
                     </Card>
                  ))
               ) : (
                  <Empty description="Không tìm thấy mẫu máy nào trong hệ thống. Vui lòng thử lại sau..." className='col-span-2 mt-4' />
               )}
            </div>
         </Drawer>
         <OverlayControllerWithRef ref={control_machineModelDetailsDrawer}>
            <MachineModel_DetailsDrawer onSubmit={(machineModel) => {
               control_machineModelDetailsDrawer.current?.handleClose()
               props.onSubmit?.(machineModel)
            }} />
         </OverlayControllerWithRef>
      </>
   )
}

export default PickMachineModelDrawer
export type { PickMachineModelDrawerProps }
