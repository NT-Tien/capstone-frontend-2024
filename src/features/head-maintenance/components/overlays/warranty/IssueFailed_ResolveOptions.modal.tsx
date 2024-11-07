import ClickableArea from "@/components/ClickableArea"
import { Swap, Truck, Wrench } from "@phosphor-icons/react"
import { Modal } from "antd"
import { ModalProps } from "antd/lib"

type IssueFailed_ResolveOptionsProps = {
   onChooseWarranty?: () => void
   onChooseFix?: () => void
   onChooseRenew?: () => void
}
type Props = Omit<ModalProps, "children"> &
   IssueFailed_ResolveOptionsProps & {
      handleClose?: () => void
   }

function IssueFailed_ResolveOptions(props: Props) {
   return (
      <Modal title="Lựa chọn" centered footer={null} {...props}>
         <div className="grid grid-cols-2 gap-2">
            <ClickableArea
               className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-blue-500 p-2 text-white"
               onClick={() => {
                  props.handleClose?.()
                  setTimeout(() => {
                     props.onChooseWarranty?.()
                  }, 150)
               }}
            >
               <Truck size={40} />
               <h1 className="whitespace-pre-wrap font-bold">Bảo hành tiếp</h1>
               <div className="whitespace-pre-wrap text-xs">Phân công lại tác vụ và chọn ngày bảo hành mới</div>
            </ClickableArea>
            <ClickableArea
               className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-yellow-500 p-2 text-white"
               onClick={() => {
                  props.handleClose?.()
                  setTimeout(() => {
                     props.onChooseFix?.()
                  }, 150)
               }}
            >
               <Wrench size={40} />
               <h1 className="whitespace-pre-wrap font-bold">Sửa chữa máy</h1>
               <div className="whitespace-pre-wrap text-xs">Liệt kê lỗi máy và sửa chữa trực tiếp tại xưởng</div>
            </ClickableArea>
            <ClickableArea
               className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-purple-500 p-2 text-white"
               onClick={() => {
                  props.handleClose?.()
                  setTimeout(() => {
                     props.onChooseRenew?.()
                  }, 150)
               }}
            >
               <Swap size={40} />
               <h1 className="whitespace-pre-wrap font-bold">Thay máy mới</h1>
               <div className="whitespace-pre-wrap text-xs">Thay bằng máy mới trong kho</div>
            </ClickableArea>
         </div>
      </Modal>
   )
}

export default IssueFailed_ResolveOptions
export type { IssueFailed_ResolveOptionsProps }
