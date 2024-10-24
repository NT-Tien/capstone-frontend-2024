import CreateSignatureDrawer, { CreateSignatureDrawerRefType } from "@/components/overlays/CreateSignature.drawer"
import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"
import useModalControls from "@/lib/hooks/useModalControls"
import { InfoCircleOutlined } from "@ant-design/icons"
import { WashingMachine, Wrench } from "@phosphor-icons/react"
import { Button, Card, Drawer, Empty, List, Modal, QRCode } from "antd"
import { create } from "domain"
import { forwardRef, ReactNode, useImperativeHandle, useRef, useState } from "react"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"

type Props = {
   children?: (handleOpen: (qrCode: string, renewDevice: DeviceDto) => void) => ReactNode
   title?: string
   description?: string
   refetch: () => void
   onComplete?: () => void
}

export type QrCodeDisplayForRenewModalRefType = {
   handleOpen: (qrCode: string, renewDevice: DeviceDto) => void
}

const QrCodeDisplayForRenewModal = forwardRef<QrCodeDisplayForRenewModalRefType, Props>(function Component(
   { children, ...props },
   ref,
) {
   const [qrCode, setQrCode] = useState<string | undefined>(undefined)
   const [device, setDevice] = useState<DeviceDto | undefined>(undefined)

   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (qrCode: string, renewDevice: DeviceDto) => {
         setQrCode(qrCode)
         setDevice(renewDevice)
      },
      onClose: () => {
         setTimeout(() => {
            setQrCode(undefined)
            setDevice(undefined)
         }, 500)
      },
   })

   const createSignatureDrawerRef = useRef<CreateSignatureDrawerRefType | null>(null)

   function handleCompleteSpareParts() {
      createSignatureDrawerRef.current?.handleClose()
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
               <Button
                  className="w-full"
                  size="large"
                  type="primary"
                  onClick={() => createSignatureDrawerRef.current?.handleOpen()}
               >
                  Ký xác nhận
               </Button>
            }
         >
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
            <section className="mt-layout">
               <h4 className="mb-layout text-lg font-medium">
                  <Wrench size={24} weight="duotone" className="mr-1 inline" />
                  Thiết bị mới
               </h4>
               <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                     <h5 className="font-medium text-gray-500">Tên thiết bị</h5>
                     <p className="mt-1">{device?.machineModel.name}</p>
                  </div>
                  <div className="flex items-start justify-between">
                     <h5 className="font-medium text-gray-500">Nhà sản xuất</h5>
                     <p className="mt-1">{device?.machineModel.manufacturer}</p>
                  </div>
               </div>
            </section>
         </Drawer>
         <CreateSignatureDrawer
            ref={createSignatureDrawerRef}
            onSubmit={handleCompleteSpareParts}
            text="Tôi xác nhận đã lấy linh kiện thành công"
         />
      </>
   )
})

export default QrCodeDisplayForRenewModal
