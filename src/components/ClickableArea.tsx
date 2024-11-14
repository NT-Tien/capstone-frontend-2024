import { cn } from "@/lib/utils/cn.util"
import { Button, GetProps } from "antd"
import { forwardRef, ReactNode } from "react"

type RefType = HTMLButtonElement | null
type Props = {} & GetProps<typeof Button>

const ClickableArea = forwardRef<RefType, Props>(function ClickableAreaComponent(props, ref) {
   const { className, ...propsRest } = props

   return (
      <Button ref={ref} className={cn("h-auto p-0 text-left", className)} {...propsRest}>
         {props?.children}
      </Button>
   )
})

export default ClickableArea
