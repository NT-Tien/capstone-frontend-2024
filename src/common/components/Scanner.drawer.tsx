import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { App, Avatar, Button, Card, Drawer, DrawerProps, Form, Input } from "antd"
import { InfoCircleFilled, InfoCircleOutlined, RightOutlined } from "@ant-design/icons"
import { isUUID } from "@/common/util/isUUID.util"
import { useTranslation } from "react-i18next"
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner"
import ScannerInputManualDrawer from "@/common/components/ScannerInputManual.drawer"
import useModalControls from "@/common/hooks/useModalControls"

type Props = {
   children: (handleOpen: () => void) => ReactNode
   onScan: (result: string) => void
   drawerProps?: DrawerProps
}

export default function ScannerDrawer({ children, ...props }: Props) {
   const { t } = useTranslation()

   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {},
   })

   async function handleFinish(res: string, handleCloseManual?: () => void) {
      handleClose()
      handleCloseManual?.()
      props.onScan(res)
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title="Quét mã QR"
            placement="bottom"
            height="max-content"
            {...props.drawerProps}
         >
            <section className="grid place-items-center">
               <div className="mb-6 flex items-center rounded-full border-2 border-neutral-200 bg-white px-6 py-1">
                  Vui lòng đặt <strong className="mx-1.5 font-semibold">mã QR của thiết bị</strong> vào khung hình
                  <InfoCircleOutlined className="ml-2" />
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
                           <p className="text-xs">{t("CannotScan")}</p>
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
}