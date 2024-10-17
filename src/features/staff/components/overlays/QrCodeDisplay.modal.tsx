import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"
import useModalControls from "@/lib/hooks/useModalControls"
import { InfoCircleOutlined } from "@ant-design/icons"
import { Wrench } from "@phosphor-icons/react"
import { Button, Card, Drawer, Empty, QRCode } from "antd"
import { forwardRef, ReactNode, useImperativeHandle, useState } from "react"
import AlertCard from "@/components/AlertCard"

type Props = {
   children?: (handleOpen: (qrCode: string, issueSpareParts: IssueSparePartDto[]) => void) => ReactNode
   title?: string
   description?: string
   refetch: () => void
   onComplete?: () => void
}

export type QrCodeDisplayModalRefType = {
   handleOpen: (qrCode: string, issueSpareParts: IssueSparePartDto[]) => void
}

const QrCodeDisplayModal = forwardRef<QrCodeDisplayModalRefType, Props>(function Component(
   { children, ...props },
   ref,
) {
   const [qrCode, setQrCode] = useState<string | undefined>(undefined)
   const [spareParts, setSpareParts] = useState<IssueSparePartDto[]>([])
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (qrCode: string, issueSpareParts: IssueSparePartDto[]) => {
         setQrCode(qrCode)
         setSpareParts(issueSpareParts)
      },
      onClose: () => {
         setTimeout(() => {
            setQrCode(undefined)
            setSpareParts([])
         }, 500)
      },
   })

   function handleCompleteSpareParts() {
      handleClose()
      props.onComplete?.()
      setTimeout(() => {
         props.refetch?.()
      }, 500)
   }

   useImperativeHandle(ref, () => ({
      handleOpen,
      handleClose,
   }))

   return (
      <>
         {children?.(handleOpen)}
         <Drawer
            title={props.title ?? "Qr Code"}
            open={open}
            onClose={handleClose}
            placement="bottom"
            height="max-content"
            classNames={{
               footer: "p-layout",
            }}
            footer={
               <Button className="w-full" size="large" type="primary" onClick={handleCompleteSpareParts}>
                  Hoàn tất
               </Button>
            }
         >
            {props.description && <AlertCard text={props.description} type="info" className="mb-3" />}
            <QRCode value={qrCode ?? ""} className="aspect-square h-full w-full" />
            <section className="my-layout">
               <h4
                  className="mb-2 text-lg font-medium"
                  onClick={() => {
                     window.navigator.clipboard.writeText(qrCode ?? "")
                  }}
               >
                  <Wrench size={24} weight="duotone" className="mr-1 inline" />
                  Linh kiện
               </h4>
               <div className="h-max max-h-44 overflow-auto rounded-md border-2 border-neutral-100 bg-neutral-50 p-2 pb-4">
                  {spareParts?.map((issueSparePart, index) => (
                     <div key={issueSparePart.id} className="flex items-center justify-between">
                        <span>
                           {index + 1}. {issueSparePart.sparePart.name}
                        </span>
                        <span>x{issueSparePart.quantity}</span>
                     </div>
                  ))}
                  {spareParts?.length === 0 && (
                     <div className="grid h-full place-items-center">
                        <Empty description="Không có linh kiện" />
                     </div>
                  )}
               </div>
            </section>
         </Drawer>
      </>
   )
})

export default QrCodeDisplayModal
