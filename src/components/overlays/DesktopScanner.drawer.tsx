import ScannerInputManualDrawer from "@/components/overlays/ScannerInputManual.drawer"
import useModalControls from "@/lib/hooks/useModalControls"
import { RightOutlined } from "@ant-design/icons"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Avatar, Button, Card, Drawer, DrawerProps } from "antd"
import { ReactNode } from "react"
import AlertCard from "@/components/AlertCard"

type Props = {
   children: (handleOpen: () => void) => ReactNode
   onScan: (result: string) => void
   drawerProps?: DrawerProps
   alertText?: string
}

export default function DesktopScannerDrawer({ children, ...props }: Props) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {},
   })

   async function handleFinish(res: string, handleCloseManual?: () => void) {
      props.onScan(res)
      handleCloseManual?.()
      handleClose()
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title="Quét mã QR"
            placement="right"
            width="30%"
            destroyOnClose
            classNames={{
               footer: "p-layout",
            }}
            footer={
               <ScannerInputManualDrawer
                  drawerProps={{
                     placement: "right",
                     width: "max-content",
                  }}
                  onFinish={handleFinish}
               >
                  {(handleOpen) => (
                     <Card size="small" hoverable onClick={handleOpen}>
                        <div className="flex items-center gap-3">
                           <Avatar style={{ fontSize: "18px", textAlign: "center", backgroundColor: "#6750A4" }}>
                              AI
                           </Avatar>
                           <div className="flex-grow">
                              <p className="text-base font-bold">Nhập thủ công</p>
                              <p className="text-xs">Nhấp vào đây nếu bạn không thể quét mã QR</p>
                           </div>
                           <div>
                              <Button type="text" icon={<RightOutlined />} />
                           </div>
                        </div>
                     </Card>
                  )}
               </ScannerInputManualDrawer>
            }
            {...props.drawerProps}
         >
            <div className="w-96">
               <AlertCard
                  className="mb-layout"
                  text={props.alertText ?? "Đặt mã QR vào khung quét để bắt đầu"}
                  type="info"
               />
               <Scanner
                  paused={!open}
                  onScan={async (e) => {
                     if (e.length === 0) return

                     const currentId = e[0].rawValue

                     // only continue if currentId exists
                     if (currentId) {
                        await handleFinish(currentId)
                     }
                  }}
                  allowMultiple={true}
                  scanDelay={1000}
                  components={{}}
                  constraints={{}}
                  styles={{
                     container: {
                        width: "24rem",
                        //  aspectRatio: "1/1",
                        //  borderRadius: "1rem !important",
                     },
                  }}
               />
            </div>
         </Drawer>
      </>
   )
}
