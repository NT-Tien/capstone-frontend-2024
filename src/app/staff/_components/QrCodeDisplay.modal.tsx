import useModalControls from "@/common/hooks/useModalControls"
import { Button, Card, Modal, QRCode } from "antd"
import { ReactNode, useState } from "react"
import { InfoCircleOutlined } from "@ant-design/icons"

type Props = {
   title?: string
   description?: string
   onSubmit: (handleClose: () => void) => void
}

export default function QrCodeDisplayModal({
   children,
   ...props
}: {
   children: (handleOpen: (qrCode: string) => void) => ReactNode
} & Props) {
   const [qrCode, setQrCode] = useState<string | undefined>(undefined)
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (qrCode: string) => {
         setQrCode(qrCode)
      },
      onClose: () => {
         setQrCode(undefined)
      },
   })

   return (
      <>
         {children(handleOpen)}
         <Modal
            title={props.title ?? "Qr Code"}
            open={open}
            onCancel={handleClose}
            footer={
               <Button type="primary" size="large" className="w-full" onClick={() => props.onSubmit(handleClose)}>
                  Hoàn tất lấy linh kiện
               </Button>
            }
         >
            {props.description && (
               <Card size="small" className="mb-2">
                  <div className="flex gap-3">
                     <InfoCircleOutlined />
                     <div className="flex-grow">{props.description}</div>
                  </div>
               </Card>
            )}
            <QRCode value={qrCode ?? ""} className="aspect-square h-full w-full" />
         </Modal>
      </>
   )
}
