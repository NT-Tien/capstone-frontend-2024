"use client"

import { Button, Drawer, DrawerProps } from "antd"
import { SignatureController, SignatureControllerRefType } from "@/components/overlays/CreateSignature.drawer"
import AlertCard from "@/components/AlertCard"
import { useEffect, useRef, useState } from "react"
import { CanvasPath } from "react-sketch-canvas"

type DualSignatureDrawerProps = {
   onSubmit?: (staff: string, stockkeeper: string) => void
}
type Props = Omit<DrawerProps, "children"> & DualSignatureDrawerProps

function DualSignatureDrawer(props: Props) {
   const [staffStrokes, setStaffStrokes] = useState<CanvasPath[]>([])
   const [stockkeeperStrokes, setStockkeeperStrokes] = useState<CanvasPath[]>([])

   const staffSignatureRef = useRef<SignatureControllerRefType | null>(null)
   const stockkeeperSignatureRef = useRef<SignatureControllerRefType | null>(null)

   async function handleSubmit() {
      const staff = await staffSignatureRef.current?.handleExport()
      const stockkeeper = await stockkeeperSignatureRef.current?.handleExport()
      if (staff && stockkeeper) {
         props.onSubmit?.(staff, stockkeeper)
      }
   }

   useEffect(() => {
      if (!props.open) {
         setStaffStrokes([])
         setStockkeeperStrokes([])
         staffSignatureRef.current?.handleClear()
         stockkeeperSignatureRef.current?.handleClear()
      }
   }, [props.open])

   return (
      <Drawer
         title="Kỹ tên xác nhận"
         placement="right"
         width="100%"
         footer={
            <div className="flex justify-end">
               <Button
                  type="primary"
                  disabled={staffStrokes.length === 0 || stockkeeperStrokes.length === 0}
                  onClick={handleSubmit}
               >
                  Xác nhận
               </Button>
            </div>
         }
         classNames={{
            footer: "p-layout",
         }}
         {...props}
      >
         <div className="grid h-full grid-cols-2 gap-3">
            <section>
               <AlertCard text="Vui lòng thêm chữ ký nhân viên sửa chữa" type="info" />
               <SignatureController
                  strokes={staffStrokes}
                  setStrokes={setStaffStrokes}
                  height="100%"
                  className="h-full"
                  ref={staffSignatureRef}
               />
            </section>
            <section>
               <AlertCard text="Vui lòng thêm chữ ký thủ kho" type="info" />
               <SignatureController
                  strokes={stockkeeperStrokes}
                  setStrokes={setStockkeeperStrokes}
                  height="100%"
                  className="h-full"
                  ref={stockkeeperSignatureRef}
               />
            </section>
         </div>
      </Drawer>
   )
}

export default DualSignatureDrawer
export type { DualSignatureDrawerProps }
