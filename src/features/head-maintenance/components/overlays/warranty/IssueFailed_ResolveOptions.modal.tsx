import ClickableArea from "@/components/ClickableArea"
import EmptyState from "@/components/EmptyState"
import { Empty, Swap, Truck, Wrench } from "@phosphor-icons/react"
import { Modal } from "antd"
import { ModalProps } from "antd/lib"

type IssueFailed_ResolveOptionsProps = {
   onChooseWarranty?: () => void
   onChooseFix?: () => void
   onChooseRenew?: () => void
   showButtons?: ("warranty" | "fix" | "renew")[]
}
type Props = Omit<ModalProps, "children"> &
   IssueFailed_ResolveOptionsProps & {
      handleClose?: () => void
   }

function IssueFailed_ResolveOptions(props: Props) {
   return (
      <Modal
         title={
            <div className="">
               <h1 className="text-base font-semibold">Lựa chọn giải pháp</h1>
               <p className="text-sm font-normal text-neutral-500">
                  Chọn một trong các giải pháp dưới đây để tiếp tục xử lý yêu cầu
               </p>
            </div>
         }
         centered
         footer={null}
         {...props}
      >
         <div className="grid grid-cols-2 gap-2 pt-3">
            <ClickableArea
               className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-blue-500 p-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
               onClick={() => {
                  props.handleClose?.()
                  setTimeout(() => {
                     props.onChooseWarranty?.()
                  }, 150)
               }}
               disabled={props.showButtons?.includes("warranty") === false}
            >
               <Truck size={40} />
               <h1 className="whitespace-pre-wrap font-bold">Bảo hành tiếp</h1>
               <div className="whitespace-pre-wrap text-center text-xs">
                  Phân công lại tác vụ và chọn ngày bảo hành mới
               </div>
            </ClickableArea>
            <ClickableArea
               className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-yellow-500 p-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
               onClick={() => {
                  props.handleClose?.()
                  setTimeout(() => {
                     props.onChooseFix?.()
                  }, 150)
               }}
               disabled={props.showButtons?.includes("fix") === false}
            >
               <Wrench size={40} />
               <h1 className="whitespace-pre-wrap font-bold">Sửa chữa máy</h1>
               <div className="whitespace-pre-wrap text-center text-xs">
                  Liệt kê lỗi máy và sửa chữa trực tiếp tại xưởng
               </div>
            </ClickableArea>
            <ClickableArea
               className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-purple-500 p-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
               onClick={() => {
                  props.handleClose?.()
                  setTimeout(() => {
                     props.onChooseRenew?.()
                  }, 150)
               }}
               disabled={props.showButtons?.includes("renew") === false}
            >
               <Swap size={40} />
               <h1 className="whitespace-pre-wrap font-bold">Thay máy mới</h1>
               <div className="whitespace-pre-wrap text-center text-xs">Thay bằng máy mới trong kho</div>
            </ClickableArea>
            <ClickableArea
               className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-green-500 p-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
               disabled={true}
            >
               <Empty size={40} />
               <h1 className="whitespace-pre-wrap font-bold">Chưa có</h1>
               <div className="whitespace-pre-wrap text-center text-xs"></div>
            </ClickableArea>
         </div>
      </Modal>
   )
}

export default IssueFailed_ResolveOptions
export type { IssueFailed_ResolveOptionsProps }
