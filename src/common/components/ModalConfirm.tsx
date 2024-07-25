import { cloneElement, ReactElement, ReactNode, useState } from "react"
import { Button, ButtonProps, Modal, ModalProps } from "antd"
import useModalControls from "@/common/hooks/useModalControls"

export type Props = {
   children: ReactElement
   title?: ReactNode
   description?: ReactNode
   confirmText?: string
   onConfirm?: () => void
   confirmProps?: ButtonProps
   cancelText?: string
   onCancel?: () => string
   cancelProps?: ButtonProps
   modalProps?: ModalProps
   closeAfterConfirm?: boolean
}

export default function ModalConfirm(props: Props) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         props.onCancel?.()
      },
   })

   const modifiedChildren = cloneElement(props.children as any, {
      onClick: handleOpen,
   })

   return (
      <>
         {modifiedChildren}
         <Modal
            title={props.title ?? "Lưu ý"}
            open={open}
            onOk={() => {
               props.onConfirm?.()
               // if (props.closeAfterConfirm) handleClose()
            }}
            centered={true}
            onCancel={() => {
               handleClose()
            }}
            footer={[
               <Button key="back" onClick={handleClose} {...props.cancelProps}>
                  {props.cancelText ?? "Hủy bỏ"}
               </Button>,
               <Button
                  key="confirm"
                  type="primary"
                  onClick={() => {
                     props.onConfirm?.()
                     // if (props.closeAfterConfirm) handleClose()
                  }}
                  {...props.confirmProps}
               >
                  {props.confirmText ?? "Đồng ý"}
               </Button>,
            ]}
            {...props.modalProps}
         >
            {props.description ?? "Bạn có chắc chắn muốn thực hiện hành động này không?"}
         </Modal>
      </>
   )
}
