import useModalControls from "@/common/hooks/useModalControls"
import { Button, Card, Input, List, Modal, QRCode } from "antd"
import { ReactNode, useState } from "react"
import { InfoCircleOutlined } from "@ant-design/icons"
import { FixRequestIssueSparePartDto } from "@/common/dto/FixRequestIssueSparePart.dto"

type Props = {
   title?: string
   description?: string
   refetch: () => void
}

export default function QrCodeDisplayModal({
   children,
   ...props
}: {
   children: (handleOpen: (qrCode: string, issueSpareParts: FixRequestIssueSparePartDto[]) => void) => ReactNode
} & Props) {
   const [qrCode, setQrCode] = useState<string | undefined>(undefined)
   const [spareParts, setSpareParts] = useState<FixRequestIssueSparePartDto[]>([])
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (qrCode: string, issueSpareParts: FixRequestIssueSparePartDto[]) => {
         setQrCode(qrCode)
         setSpareParts(issueSpareParts)
      },
      onClose: () => {
         setQrCode(undefined)
         setSpareParts([])
         props.refetch()
      },
   })

   return (
      <>
         {children(handleOpen)}
         <Modal title={props.title ?? "Qr Code"} open={open} onCancel={handleClose} footer={null}>
            {props.description && (
               <Card size="small" className="mb-2">
                  <div className="flex gap-3">
                     <InfoCircleOutlined />
                     <div className="flex-grow">{props.description}</div>
                  </div>
               </Card>
            )}
            <QRCode value={qrCode ?? ""} className="aspect-square h-full w-full" />
            <Card className="mt-layout w-full" size="small">
               <Input className="w-full" value={qrCode} onChange={() => {}} />
            </Card>
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
         </Modal>
      </>
   )
}
