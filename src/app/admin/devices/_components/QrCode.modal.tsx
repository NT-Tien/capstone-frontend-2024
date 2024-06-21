import { ReactNode, useState } from "react"
import { Modal, QRCode } from "antd"

export default function QrCodeModal({ children }: { children: (handleOpen: (id: string) => void) => ReactNode }) {
   const [open, setOpen] = useState(false)
   const [id, setId] = useState<undefined | string>(undefined)

   function handleOpen(id: string) {
      setOpen(true)
      setId(id)
   }

   function handleClose() {
      setOpen(false)
      setId(undefined)
   }

   function downloadQrCode() {
      const canvas = document.getElementById("qr-container")?.querySelector<HTMLCanvasElement>("canvas")
      if (canvas) {
         const url = canvas.toDataURL()
         const a = document.createElement("a")
         a.download = "QRCode.png"
         a.href = url
         document.body.appendChild(a)
         a.click()
         document.body.removeChild(a)
      }
   }

   return (
      <>
         {children(handleOpen)}
         <Modal open={open} onCancel={handleClose} title="Qr Code" okText="Download" onOk={downloadQrCode}>
            <div id="qr-container" className="w-full">
               {id && <QRCode value={id} className="aspect-square h-full w-full" />}
            </div>
         </Modal>
      </>
   )
}
