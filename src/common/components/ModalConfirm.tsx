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
   closeBeforeConfirm?: boolean
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
            centered={true}
            onCancel={handleClose}
            footer={[
               <Button
                  key="back"
                  onClick={() => {
                     handleClose()
                     setTimeout(() => {
                        props.onCancel?.()
                     }, 300)
                  }}
                  {...props.cancelProps}
               >
                  {props.cancelText ?? "Hủy bỏ"}
               </Button>,
               <Button
                  key="confirm"
                  type="primary"
                  onClick={() => {
                     if (props.closeBeforeConfirm === true || props.closeBeforeConfirm === undefined) {
                        handleClose()
                        setTimeout(() => {
                           props.onConfirm?.()
                        }, 300)
                     } else {
                        props.onConfirm?.()
                     }
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
