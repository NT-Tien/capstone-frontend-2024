import { Drawer, DrawerProps, QRCode } from "antd"

type QrCodeDrawerProps = {
   qrCodeValue?: string
}
type Props = Omit<DrawerProps, "children"> & QrCodeDrawerProps

function QrCodeDrawer(props: Props) {
   return (
      <Drawer {...props}>
         <QRCode className={"aspect-square h-full w-full"} value={props.qrCodeValue ?? ""} />
      </Drawer>
   )
}

export default QrCodeDrawer
export type { QrCodeDrawerProps }
