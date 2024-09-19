import ScannerInputManualDrawer from "@/common/components/ScannerInputManual.drawer"
import useModalControls from "@/common/hooks/useModalControls"
import { InfoCircleOutlined, RightOutlined } from "@ant-design/icons"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Avatar, Button, Card, Drawer, DrawerProps } from "antd"
import { forwardRef, ReactNode, useImperativeHandle } from "react"

export type ScannerV2DrawerRefType = {
   handleOpen: () => void
}

type Props = {
   children?: (handleOpen: () => void) => ReactNode
   onScan: (result: string) => void
   drawerProps?: DrawerProps
}

const ScannerV2Drawer = forwardRef<ScannerV2DrawerRefType, Props>(function Component({ children, ...props }, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => { },
   })

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   async function handleFinish(res: string, handleCloseManual?: () => void) {
      props.onScan(res)
      handleCloseManual?.()
      handleClose()
   }

   return (
      <>
         {children?.(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title="Quét mã QR"
            placement="bottom"
            height="max-content"
            destroyOnClose
            {...props.drawerProps}
         >
            <section className="grid place-items-center">
               <div className="mb-6 flex items-center gap-3 rounded-full border-2 border-neutral-200 bg-white px-2 py-1">
                  <InfoCircleOutlined />
                  <span className="text-xs">
                     Vui lòng đặt<strong className="mx-1 font-semibold">mã QR của thiết bị</strong>vào khung hình
                  </span>
               </div>
            </section>
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
                     width: "100%",
                     aspectRatio: "1/1",
                     borderRadius: "1rem !important",
                  },
                  video: {
                     borderRadius: "1rem !important",
                  },
               }}
            />
            <ScannerInputManualDrawer onFinish={handleFinish}>
               {(handleOpen) => (
                  <Card size="small" hoverable onClick={handleOpen} className="mt-layout">
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
         </Drawer>
      </>
   )
})

export default ScannerV2Drawer
