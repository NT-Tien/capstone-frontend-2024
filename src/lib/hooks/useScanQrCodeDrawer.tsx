"use client"

import { useEffect, useRef, useState } from "react"
import { App } from "antd"
import ScannerV3Drawer, { ScannerV3DrawerProps } from "@/components/overlays/ScannerV3.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"

type Props = {
   validationFn: (data: string) => Promise<boolean>
   defaultScanned?: boolean
   onSuccess?: (data: string) => void
   onError?: (error: unknown) => void
   showMessages?: boolean
   messages?: {
      success?: string
      error?: string
   },
   infoText?: string
   closeOnScan?: boolean
}

function useScanQrCodeDrawer<T>(props: Props, dependencies?: T[]) {
   const { message } = App.useApp()
   const [status, setStatus] = useState<"none" | "scanned">("none")

   const control_scannerDrawer = useRef<RefType<ScannerV3DrawerProps> | null>(null)

   useEffect(() => {
      if (props.defaultScanned) {
         setStatus("scanned")
      }
   }, [dependencies, props.defaultScanned])

   function handleOpenScanner() {
      control_scannerDrawer.current?.handleOpen({})
   }

   async function handleScan(data: string) {
      try {
         const isValid = await props.validationFn(data)
         if (!isValid) {
            props.showMessages && message.error(props.messages?.error ?? "Mã QR không hợp lệ")

            props.onError?.(null)
            return
         }

         setStatus("scanned")
         props.showMessages && message.success(props.messages?.success ?? "Mã QR hợp lệ")
         props.onSuccess?.(data)
      } catch (error) {
         console.error(error)
         props.onError?.(error)
      }
   }

   const contextHolder = function () {
      return (
         <OverlayControllerWithRef ref={control_scannerDrawer}>
            <ScannerV3Drawer closeOnScan={props.closeOnScan} onScan={handleScan} infoText={props.infoText} />
         </OverlayControllerWithRef>
      )
   }

   return {
      status,
      contextHolder,
      handleOpenScanner,
      isScanned: status === "scanned",
      isNone: status === "none",
   }
}

export default useScanQrCodeDrawer
