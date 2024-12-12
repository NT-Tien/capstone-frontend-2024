"use client"

import { Download } from "@phosphor-icons/react"
import { Button, Modal, ModalProps, QRCode } from "antd"

type QrCodeV2ModalProps = {
   content?: string
}

type Props = Omit<ModalProps, "children"> & QrCodeV2ModalProps

function doDownload(url: string, fileName: string) {
   const a = document.createElement('a');
   a.download = fileName;
   a.href = url;
   document.body.appendChild(a);
   a.click();
   document.body.removeChild(a);
 }
 
 const downloadCanvasQRCode = () => {
   const canvas = document.getElementById('myqrcode')?.querySelector<HTMLCanvasElement>('canvas');
   if (canvas) {
     const url = canvas.toDataURL();
     doDownload(url, 'QRCode.png');
   }
 };
 

function QrCodeV2Modal(props: Props) {
   return (
      <Modal
         {...props}
         centered
         footer={
            <Button type="primary" icon={<Download size={18} weight="fill" />} onClick={() => downloadCanvasQRCode()}>
               Tải QR
            </Button>
         }
      >
         <div id="qr-container" className="w-full">
            {props.content && <QRCode value={props.content} className="aspect-square h-full w-full" id="myqrcode" />}
         </div>
      </Modal>
   )
}

export default QrCodeV2Modal
export type { QrCodeV2ModalProps }
