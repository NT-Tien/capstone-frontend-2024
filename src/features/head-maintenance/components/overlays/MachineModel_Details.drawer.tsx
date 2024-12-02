import { Drawer, DrawerProps } from "antd"

type MachineModel_DetailsDrawerProps = {}
type Props = Omit<DrawerProps, 'children'> & MachineModel_DetailsDrawerProps

function MachineModel_DetailsDrawer(props: Props) {
    return (
        <Drawer {...props}></Drawer>
    )
}

export default MachineModel_DetailsDrawer
export type { MachineModel_DetailsDrawerProps }