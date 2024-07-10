import { cloneElement, ReactElement, ReactNode } from "react"
import { HomeOutlined } from "@ant-design/icons"
import { Button } from "antd"

type Props = {
   icon: ReactElement
   title: string
   onClick: () => void
}

export default function FunctionButton(props: Props) {
   const displayIcon = cloneElement(props.icon, {
      style: {
         fontSize: "24px",
      },
   })
   return (
      <Button className="aspect-square h-full w-full">
         {displayIcon}
         <div className="mt-2">{props.title}</div>
      </Button>
   )
}
