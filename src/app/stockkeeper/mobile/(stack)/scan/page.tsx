"use client"

import RootHeader from "@/common/components/RootHeader"
import ScannerInputManualDrawer from "@/common/components/ScannerInputManual.drawer"
import { isUUID } from "@/common/util/isUUID.util"
import { InfoCircleOutlined, LeftOutlined, RightOutlined, SearchOutlined } from "@ant-design/icons"
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner"
import { App, Avatar, Button, Card, Spin } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useTransition } from "react"
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types"

export default function ScanPage() {
   const router = useRouter()
   const { message } = App.useApp()
   const timeoutRef = useRef<NodeJS.Timeout>()

   const [isLoading, startTransition] = useTransition()

   async function handleScan(e: IDetectedBarcode[]) {
      if (e.length === 0) return

      const currentId = e[0].rawValue

      // only continue if currentId exists
      if (currentId) {
         await finishHandler(currentId)
      }
   }

   async function finishHandler(id: string, handleClose?: () => void) {
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
         message.destroy("messenger")
      }, 3000)

      if (!isUUID(id)) {
         await message.open({
            content: "ID thiết bị không hợp lệ",
            duration: 0,
            type: "error",
            key: "messenger",
         })

         return
      }

      handleClose?.()

      setTimeout(() => {
         startTransition(() => {
            router.push(`/stockkeeper/mobile/scan-results/${id}`)
         })
      }, 200)

      return
   }

   useEffect(() => {
      router.prefetch("/stockkeeper/mobile/scan-results/e31d662e-05db-4bc4-8bfd-773f56618725", {
         kind: PrefetchKind.AUTO,
      })
   }, [router])

   return (
      <div className="h-full">
         {isLoading && <Spin fullscreen className="z-[5000]" />}
         <div>
            <RootHeader title="Quét mã QR" className="p-4" icon={<LeftOutlined />} onIconClick={() => router.push("/stockkeeper/mobile/dashboard")} />
            <section className="my-6 grid place-items-center">
               <div className="flex items-center rounded-full bg-white px-6 py-1">
                  Vui lòng đặt <strong className="mx-1.5 font-semibold">mã QR của tác vụ</strong> vào khung hình
                  <InfoCircleOutlined className="ml-2" />
               </div>
            </section>
            <Scanner
               paused={false}
               onScan={handleScan}
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
            <section className="p-4">
               <ScannerInputManualDrawer onFinish={finishHandler} disabled={isLoading}>
                  {(handleOpen) => (
                     <Card size="small" hoverable onClick={handleOpen}>
                        <div className="flex items-center gap-3">
                           <Avatar style={{ fontSize: "18px", textAlign: "center", backgroundColor: "#6750A4" }}>
                              AI
                           </Avatar>
                           <div className="flex-grow">
                              <p className="text-base font-bold">Không quét mã được?</p>
                              <p className="text-xs">Nhấp vào đây nếu bạn không thể quét mã QR</p>
                           </div>
                           <div>
                              <Button type="text" icon={<RightOutlined />} />
                           </div>
                        </div>
                     </Card>
                  )}
               </ScannerInputManualDrawer>
            </section>
         </div>
      </div>
   )
}
