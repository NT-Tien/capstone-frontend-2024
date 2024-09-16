import { CheckSquareOffset, Gear, Scan } from "@phosphor-icons/react"
import { Button, Drawer } from "antd"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction } from "react"

type Props = {
   open: boolean
   setOpen: Dispatch<SetStateAction<boolean>>
}

function ToolboxDrawer(props: Props) {
   const router = useRouter()

   function handleClose() {
      props.setOpen(false)
   }

   async function handleGo(href: string) {
      router.push(href)
      handleClose()
   }

   return (
      <Drawer open={props.open} onClose={handleClose} placement="bottom" height="max-content" title="Công cụ">
         <div className="grid grid-cols-3 gap-3">
            <Button
               type="default"
               className="grid aspect-square h-full w-full place-items-center"
               onClick={() => handleGo("/stockkeeper/mobile/spare-parts")}
            >
               <Gear size={36} weight="duotone" className="text-red-500" />
               <div className="w-full text-wrap text-sm">Tất cả linh kiện</div>
            </Button>
            <Button
               type="default"
               className="grid aspect-square h-full w-full place-items-center"
               onClick={() => handleGo("/stockkeeper/mobile/tasks")}
            >
               <CheckSquareOffset size={36} weight="duotone" className="text-blue-500" />
               <div className="w-full text-wrap text-sm">Tác vụ chờ linh kiện</div>
            </Button>
            <Button
               type="default"
               className="grid aspect-square h-full w-full place-items-center"
               onClick={() => handleGo("/stockkeeper/mobile/scan")}
            >
               <Scan size={36} weight="duotone" className="text-green-500" />
               <div className="w-full text-wrap text-sm">Quét QR</div>
            </Button>
            <Button
               type="default"
               className="grid aspect-square h-full w-full place-items-center"
               onClick={() => handleGo("/stockkeeper/mobile/spare-parts/missing")}
            >
               <Gear size={36} weight="duotone" className="text-red-500" />
               <div className="w-full text-wrap text-sm">Linh kiện hết hàng</div>
            </Button>
         </div>
      </Drawer>
   )
}

export default ToolboxDrawer
