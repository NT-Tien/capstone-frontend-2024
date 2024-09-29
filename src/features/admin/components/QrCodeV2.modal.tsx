import { Modal, ModalProps, QRCode } from "antd"

type QrCodeV2ModalProps = {
   content?: string
}

type Props = Omit<ModalProps, "children"> & QrCodeV2ModalProps

function QrCodeV2Modal(props: Props) {
   return (
      <Modal {...props} centered>
         <div id="qr-container" className="w-full">
            {props.content && <QRCode value={props.content} className="aspect-square h-full w-full" />}
         </div>
      </Modal>
   )
}

export default QrCodeV2Modal
export type { QrCodeV2ModalProps }
