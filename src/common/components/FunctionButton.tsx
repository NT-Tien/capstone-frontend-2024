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
      <Button className="flex aspect-square h-full w-full flex-col items-center justify-center" onClick={props.onClick}>
         {displayIcon}
         <div className="mt-2">{props.title}</div>
      </Button>
   )
}
