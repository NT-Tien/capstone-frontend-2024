import { cloneElement, ReactElement, ReactNode, useState } from "react"
import { ButtonProps, Modal, ModalProps } from "antd"

type Props = {
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
}

export default function ModalConfirm(props: Props) {
   const [open, setOpen] = useState<boolean>(false)
   const modifiedChildren = cloneElement(props.children as any, {
      onClick: handleOpen,
   })

   function handleOpen() {
      setOpen(true)
   }

   function handleClose() {
      setOpen(false)
   }

   return (
      <>
         {modifiedChildren}
         <Modal
            title={props.title ?? "Confirm Action"}
            open={open}
            onOk={props.onConfirm}
            centered={true}
            onCancel={() => {
               props.onCancel?.()
               handleClose()
            }}
            okText={props.confirmText ?? "Confirm"}
            cancelText={props.cancelText ?? "Cancel"}
            okButtonProps={props.confirmProps}
            cancelButtonProps={props.cancelProps}
            {...props.modalProps}
         >
            {props.description ?? "Are you sure you want to perform this action?"}
         </Modal>
      </>
   )
}
