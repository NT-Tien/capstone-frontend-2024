"use client"

import useScanQrCodeDrawer from "@/lib/hooks/useScanQrCodeDrawer"
import { Button } from "antd"

function Page() {
   const qr = useScanQrCodeDrawer({
      validationFn: async () => {
         return true
      },
   })

   return (
      <div>
         {qr.contextHolder()}
         <Button onClick={qr.handleOpenScanner}>Scan QR Code</Button>
      </div>
   )
}

export default Page
