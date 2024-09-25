import { cloneElement, ReactElement, ReactNode, useState, useMemo } from "react"
import { Button, ButtonProps, Modal, ModalProps } from "antd"
import useModalControls from "@/lib/hooks/useModalControls"
import { CheckCircle, Info, XCircle, Warning, SealCheck } from "@phosphor-icons/react"

type ModalTypes = "confirm" | "info" | "success" | "error" | "warning"

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
   type?: ModalTypes
}

export default function ModalConfirm({ type = "warning", ...props }: Props) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         props.onCancel?.()
      },
   })

   const modifiedChildren = cloneElement(props.children as any, {
      onClick: handleOpen,
   })

   const title = useMemo(() => {
      if (props.title) return props.title
      switch (type) {
         case "confirm":
            return <span className="">Xác nhận</span>
         case "info":
            return <span className="text-blue-500">Thông báo</span>
         case "success":
            return <span className="text-green-500">Thành công</span>
         case "error":
            return <span className="text-red-500">Lỗi</span>
         case "warning":
         default:
            return <span className="text-yellow-500">Lưu ý</span>
      }
   }, [props.title, type])

   const icon = useMemo(() => {
      switch (type) {
         case "info":
            return <Info size={18} weight="fill" className="text-blue-500" />
         case "success":
            return <CheckCircle size={18} weight="fill" className="text-green-500" />
         case "error":
            return <XCircle size={18} weight="fill" className="text-red-500" />
         case "confirm":
            return <SealCheck size={18} weight="fill" />
         case "warning":
         default:
            return <Warning size={18} weight="fill" className="text-yellow-500" />
      }
   }, [type])

   return (
      <>
         {modifiedChildren}
         <Modal
            title={
               <div className="flex items-center gap-2">
                  {icon} {title}
               </div>
            }
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
