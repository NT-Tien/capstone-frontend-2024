import { cn } from "@/lib/utils/cn.util"
import { Button, GetProps } from "antd"
import { ReactNode } from "react"

type Props = {} & GetProps<typeof Button>

function ClickableArea(props: Props) {
   const { className, ...propsRest } = props

   return (
      <Button className={cn("h-auto p-0", className)} {...propsRest}>
         {props?.children}
      </Button>
   )
}

export default ClickableArea
