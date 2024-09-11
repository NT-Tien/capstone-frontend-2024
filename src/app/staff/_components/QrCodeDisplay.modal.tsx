import { FixRequestIssueSparePartDto } from "@/common/dto/FixRequestIssueSparePart.dto"
import useModalControls from "@/common/hooks/useModalControls"
import { InfoCircleOutlined } from "@ant-design/icons"
import { Card, List, Modal, QRCode } from "antd"
import { forwardRef, ReactNode, useImperativeHandle, useState } from "react"

type Props = {
   children?: (
      handleOpen: (qrCode: string, issueSpareParts: FixRequestIssueSparePartDto[], isWarranty?: boolean) => void,
   ) => ReactNode
   title?: string
   description?: string
   refetch: () => void
}

export type QrCodeDisplayModalRefType = {
   handleOpen: (qrCode: string, issueSpareParts: FixRequestIssueSparePartDto[], isWarranty?: boolean) => void
   handleClose: () => void
}

const QrCodeDisplayModal = forwardRef<QrCodeDisplayModalRefType, Props>(function Component(
   { children, ...props },
   ref,
) {
   const [qrCode, setQrCode] = useState<string | undefined>(undefined)
   const [spareParts, setSpareParts] = useState<FixRequestIssueSparePartDto[]>([])
   const [isWarranty, setIsWarranty] = useState<boolean>(false)
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (qrCode: string, issueSpareParts: FixRequestIssueSparePartDto[], isWarranty?: boolean) => {
         setQrCode(qrCode)
         setSpareParts(issueSpareParts)
         setIsWarranty(isWarranty ?? false)
      },
      onClose: () => {
         setQrCode(undefined)
         setSpareParts([])
         props.refetch()
      },
   })

   useImperativeHandle(ref, () => ({
      handleOpen,
      handleClose,
   }))

   return (
      <>
         {children?.(handleOpen)}
         <Modal title={props.title ?? "Qr Code"} open={open} onCancel={handleClose} footer={null}>
            {props.description && (
               <Card
                  size="small"
                  className="mb-2"
                  onClick={() => window.navigator.clipboard.writeText(qrCode?.toString() ?? "")}
               >
                  <div className="flex gap-3">
                     <InfoCircleOutlined />
                     <div className="flex-grow">{props.description}</div>
                  </div>
               </Card>
            )}
            <QRCode value={qrCode ?? ""} className="aspect-square h-full w-full" />
            {!isWarranty && (
               <section className="mt-layout">
                  <h2 className="mb-2 text-base font-semibold">Linh kiện thay thế</h2>
                  <List
                     grid={{
                        column: 2,
                     }}
                     dataSource={spareParts}
                     renderItem={(item) => (
                        <List.Item>
                           <List.Item.Meta title={item.sparePart.name} description={`Số lượng: ${item.quantity}`} />
                        </List.Item>
                     )}
                  />
               </section>
            )}
         </Modal>
      </>
   )
})

export default QrCodeDisplayModal
