"use client"

import { useEffect } from "react"
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from "html5-qrcode"

function Page() {
   useEffect(() => {
      const scanner = new Html5QrcodeScanner(
         "scanner",
         {
            qrbox: {
               width: 250,
               height: 100,
            },
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            videoConstraints: {
               width: { ideal: 1280 },
               height: { ideal: 720 },
            },
            fps: 10,
         },
         false,
      )

      scanner.render(
         (result) => {
            scanner.clear()
            console.log(result)
         },
         (e) => {
            console.error(e)
         },
      )

      return () => {
         scanner.clear()
      }
   }, [])

   return <div id="scanner" className="h-screen w-screen"></div>
}

export default Page
