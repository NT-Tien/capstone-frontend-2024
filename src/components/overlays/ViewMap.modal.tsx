import { Modal, ModalProps } from "antd"

type ViewMapModalProps = {
   coordinates?: GeolocationCoordinates
}
type Props = Omit<ModalProps, "children"> & ViewMapModalProps

function ViewMapModal(props: Props) {
   return (
      <Modal title="Thông tin bản đồ" footer={null} centered {...props}>
         {props.coordinates && <pre className="h-full w-full">{JSON.stringify(props.coordinates, null, 3)}</pre>}
      </Modal>
   )
}

export default ViewMapModal
export type { ViewMapModalProps }
