import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { Drawer, DrawerProps } from "antd"

type Device_RequestHistoryDrawerProps = {
    requests?: RequestDto[]
    currentRequest?: RequestDto
}
type Props = Omit<DrawerProps, "children"> & Device_RequestHistoryDrawerProps

function Device_RequestHistoryDrawer(props: Props) {
   return <Drawer title="Lịch sử yêu cầu" placement='right' width='100%' {...props}>
        
   </Drawer>
}

export default Device_RequestHistoryDrawer
export type { Device_RequestHistoryDrawerProps }
