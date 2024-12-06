import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { CalendarBlank, ComputerTower, Factory } from "@phosphor-icons/react"
import { Button, Drawer, DrawerProps, Image, Modal, Space, Typography } from "antd"
import { LeftOutlined } from "@ant-design/icons"
import { UseQueryResult } from "@tanstack/react-query"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

type MachineModel_DetailsDrawerProps = {
   machineModel?: MachineModelDto
   onSubmit?: (machineModel: MachineModelDto) => void
   api_request: UseQueryResult<RequestDto, Error>
}
type Props = Omit<DrawerProps, "children"> & MachineModel_DetailsDrawerProps

function MachineModel_DetailsDrawer(props: Props) {
   return (
      <Modal
         title="Chi tiết mẫu máy"
         centered
         visible={props.open}
         onCancel={props.onClose}
         // closeIcon={<LeftOutlined />}
         footer={[
            <Button key="submit" block type="primary" onClick={() => props.machineModel && props.onSubmit?.(props.machineModel) && props.onClose}>
               Chọn mẫu máy
            </Button>,
         ]}
         width="100vh"
         bodyStyle={{
            height: "100vh",
            padding: 0,
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
         }}
         className="full-screen-modal"
      >
         <div
            style={{
               flex: 2,
               padding: "20px",
               backgroundColor: "#ffffff",
               overflowY: "auto",
               borderRight: "1px solid #ddd",
               display: "grid",
               gridTemplateRows: "repeat(10, auto)",
            }}
         >
            <h2 className="text-lg font-bold">{props.machineModel?.name}</h2>
            <Image
               src={props.machineModel?.image}
               alt={props.machineModel?.name}
               rootClassName="w-full h-32"
               wrapperClassName="w-full h-32"
               className="h-32 w-full rounded-t-lg object-cover"
               preview={false}
            />
            <p>{props.machineModel?.needleType}</p>
            <p>{props.machineModel?.speed}</p>
            <p>{props.machineModel?.power}</p>
            <p>{props.machineModel?.stitch}</p>
            <p>{props.machineModel?.presser}</p>
            <p>{props.machineModel?.lubrication}</p>
            <p>{props.machineModel?.voltage}</p>
            <p>{props.machineModel?.fabric}</p>
            <p>{props.machineModel?.features}</p>
            <p>{props.machineModel?.size}</p>
         </div>

         <div
            style={{
               flex: 2,
               padding: "20px",
               backgroundColor: "#ffffff",
               overflowY: "auto",
               display: "grid",
               gridTemplateRows: "repeat(10, auto)",
            }}
         >
            <h2 className="text-lg font-bold">{props.api_request.data?.device.machineModel?.name}</h2>
            {props.api_request.data?.device.machineModel ? (
               <>
                  <Image
                     src={props.api_request.data?.device.machineModel.image}
                     alt={props.api_request.data?.device.machineModel.name}
                     rootClassName="w-full h-32"
                     wrapperClassName="w-full h-32"
                     className="h-32 w-full rounded-t-lg object-cover"
                     preview={false}
                  />
                  <p>{props.api_request.data?.device.machineModel.needleType}</p>
                  <p>{props.api_request.data?.device.machineModel.speed}</p>
                  <p>{props.api_request.data?.device.machineModel.power}</p>
                  <p>{props.api_request.data?.device.machineModel.stitch}</p>
                  <p>{props.api_request.data?.device.machineModel.presser}</p>
                  <p>{props.api_request.data?.device.machineModel.lubrication}</p>
                  <p>{props.api_request.data?.device.machineModel.voltage}</p>
                  <p>{props.api_request.data?.device.machineModel.fabric}</p>
                  <p>{props.api_request.data?.device.machineModel.features}</p>
                  <p>{props.api_request.data?.device.machineModel.size}</p>
               </>
            ) : (
               <p>Loading...</p>
            )}
         </div>
      </Modal>
   )
}

export default MachineModel_DetailsDrawer
export type { MachineModel_DetailsDrawerProps }
