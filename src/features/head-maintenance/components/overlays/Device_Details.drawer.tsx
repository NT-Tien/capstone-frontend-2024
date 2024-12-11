import DeviceDetails from "@/features/head-maintenance/components/DeviceDetails";
import { DeviceDto } from "@/lib/domain/Device/Device.dto";
import { Drawer, DrawerProps } from "antd";
import { DownOutlined } from "@ant-design/icons";

type DeviceDetailsDrawerProps = {
    device?: DeviceDto
}
type Props = Omit<DrawerProps, 'children'> & DeviceDetailsDrawerProps;

function DeviceDetailsDrawer(props: Props) {
    return (
        <Drawer title="Thông tin thiết bị" closeIcon={<DownOutlined />} loading={!props.device} placement='bottom' height='80%' {...props}>
            {props.device && <DeviceDetails device={props.device} />}
        </Drawer>
    )
}

export default DeviceDetailsDrawer;
export type { DeviceDetailsDrawerProps }