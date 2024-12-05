import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { CalendarBlank, ComputerTower, Factory } from "@phosphor-icons/react"
import { Button, Drawer, DrawerProps, Image, Space, Typography } from "antd"
import { LeftOutlined } from "@ant-design/icons"

type MachineModel_DetailsDrawerProps = {
   machineModel?: MachineModelDto
   onSubmit?: (machineModel: MachineModelDto) => void
}
type Props = Omit<DrawerProps, "children"> & MachineModel_DetailsDrawerProps

function MachineModel_DetailsDrawer(props: Props) {
   return (
      <Drawer
         title="Chi tiết mẫu máy"
         loading={!props.machineModel}
         closeIcon={<LeftOutlined />}
         footer={
            <Button block type="primary" onClick={() => props.machineModel && props.onSubmit?.(props.machineModel)}>
               Chọn mẫu máy
            </Button>
         }
         classNames={{
            footer: "p-layout",
         }}
         {...props}
      >
         {props.machineModel && (
            <>
               <div className="aspect-square w-full rounded-lg border-2 border-head_maintenance">
                  <Image
                     src={props.machineModel.image}
                     alt="image"
                     rootClassName="w-full"
                     className="aspect-square w-full rounded-lg object-fill"
                  />
               </div>
               <main className="mt-4">
                  <h1 className="text-lg font-bold">{props.machineModel.name}</h1>
                  <div className="mt-1 flex gap-4 text-sm">
                     <div className="flex items-center gap-1">
                        <Factory size={16} weight="duotone" />
                        {props.machineModel.manufacturer}
                     </div>
                     <div className="flex items-center gap-1">
                        <CalendarBlank size={16} weight="duotone" />
                        {props.machineModel.yearOfProduction}
                     </div>
                     <div className="ml-auto flex items-center gap-1 font-bold text-head_maintenance">
                        <ComputerTower size={16} weight="duotone" />
                        {props.machineModel.devices.length} thiết bị
                     </div>
                  </div>
                  <Typography.Paragraph
                     ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
                     className="mb-0 mt-4 text-sm"
                  >
                     {props.machineModel.description}
                  </Typography.Paragraph>
               </main>
            </>
         )}
      </Drawer>
   )
}

export default MachineModel_DetailsDrawer
export type { MachineModel_DetailsDrawerProps }
