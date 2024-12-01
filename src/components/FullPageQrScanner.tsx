"use client"

import QrFrame from "@/assets/qr-frame.svg"
import ClickableArea from "@/components/ClickableArea"
import { QrCode } from "@phosphor-icons/react"
import Image from "next/image"
import Scanner from "qr-scanner"
import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react"
import { InfoCircleFilled } from "@ant-design/icons"
import { ButtonProps, Spin } from "antd"

type ScannerStatus = "paused" | "started" | "loading" | "error"

type Props = {
   children?: ReactNode | ((status: ScannerStatus) => ReactNode)
   onScan?: (result: string) => void
   infoSection?: ReactNode
}

function FullPageQrScanner(props: Props) {
   const [status, setStatus] = useState<ScannerStatus>("loading")

   const videoEl = useRef<HTMLVideoElement>(null)
   const qrBoxEl = useRef<HTMLDivElement>(null)
   const scanner = useRef<Scanner>()

   useEffect(() => {
      const videoRef = videoEl.current
      const qrBoxRef = qrBoxEl.current

      if (videoRef && !scanner.current) {
         setStatus("loading")
         scanner.current = new Scanner(
            videoRef,
            (result) => {
               props.onScan?.(result.data)
            },
            {
               overlay: qrBoxRef || undefined,
               highlightCodeOutline: true,
               highlightScanRegion: true,
               preferredCamera: "environment",
               maxScansPerSecond: 1,
            },
         )

         scanner.current
            .start()
            .then(() => {
               setStatus("started")
            })
            .catch((err) => {
               setStatus("error")
               console.error(err)
            })
      }

      return () => {
         scanner.current?.stop()
         setStatus("paused")
      }
   }, [props])

   return (
      <div className="relative mx-0 h-screen w-full">
         {status === "loading" && <Spin className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />}
         <video className="size-full object-cover" ref={videoEl} />
         <div ref={qrBoxEl} className="left-0 w-full">
            {status === "started" && (
               <div className="absolute left-1/2 top-[25%] flex size-[256px] -translate-x-1/2 -translate-y-1/2 flex-col gap-3">
                  <div className="w-full scale-x-[-1]">{props.infoSection}</div>
                  <Image src={QrFrame} alt="Qr Frame" width={256} height={256} className="fill-none" />
               </div>
            )}
         </div>
         {typeof props.children === "function" ? props.children(status) : props.children}
      </div>
   )
}

FullPageQrScanner.InfoSection_1 = function FullPageQrScannerInfoSection1(
   props: PropsWithChildren<Omit<ButtonProps, "children">>,
) {
   return (
      <ClickableArea
         reset
         className="flex gap-2 rounded-md border-[1px] border-white bg-head_department p-1.5 text-sm text-white"
         {...props}
      >
         <QrCode size={20} />
         <h1 className="mr-auto">{props.children}</h1>
         <InfoCircleFilled />
      </ClickableArea>
   )
}

export default FullPageQrScanner
export type { ScannerStatus }
