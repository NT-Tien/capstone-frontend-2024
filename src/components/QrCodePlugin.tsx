// file = Html5QrcodePlugin.jsx
import { Html5QrcodeScanner } from "html5-qrcode"
import { useEffect, useState } from "react"
import { Html5QrcodeScannerConfig } from "html5-qrcode/html5-qrcode-scanner"
import dynamic from "next/dynamic"

const qrcodeRegionId = "html5qr-code-full-region"

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props: Html5QrcodeScannerConfig) => {
   let config = {
      videoConstraints: {},
   } as Html5QrcodeScannerConfig
   if (props.fps) {
      config.fps = props.fps
   }
   if (props.qrbox) {
      config.qrbox = props.qrbox
   }
   if (props.aspectRatio) {
      config.aspectRatio = props.aspectRatio
   }
   if (props.disableFlip !== undefined) {
      config.disableFlip = props.disableFlip
   }
   return config
}

const Html5QrcodePlugin = (
   props: Html5QrcodeScannerConfig & {
      qrCodeSuccessCallback: (result: string) => void
      qrCodeErrorCallback?: (error: string) => void
      verbose?: boolean
   },
) => {
   useEffect(() => {
      // when component mounts
      const config = createConfig(props)
      const verbose = props?.verbose === true
      const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose)
      html5QrcodeScanner.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback)

      // cleanup function when component will unmount
      return () => {
         html5QrcodeScanner.clear().catch((error) => {
            console.error("Failed to clear html5QrcodeScanner. ", error)
         })
      }
   }, [props])

   return <div id={qrcodeRegionId} />
}

export default dynamic(() => Promise.resolve(Html5QrcodePlugin), {
   ssr: false,
})
