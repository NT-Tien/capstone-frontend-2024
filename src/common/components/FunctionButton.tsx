"use client"

import { Button } from "antd"
import { cloneElement, ReactElement } from "react"

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
      <Button
         className="flex aspect-square h-full w-full flex-col items-center justify-center border-0"
         type="dashed"
         onClick={props.onClick}
      >
         {displayIcon}
         <div className="mt-2">{props.title}</div>
      </Button>
   )
}
