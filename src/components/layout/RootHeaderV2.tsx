"use client"

import { PropsWithChildren, ReactNode } from "react"
import { cn } from "@/lib/utils/cn.util"
import { Button, ButtonProps } from "antd"

type Props = {
   leftContent?: ReactNode
   rightContent?: ReactNode
   title: ReactNode
   classNames?: {
      leftContent?: string
      rightContent?: string
      title?: string
   }
}

function RootHeaderV2(props: Props) {
   return (
      <header className="flex items-center justify-between">
         <div className={cn(props.classNames?.leftContent)}>{props.leftContent}</div>
         <div className={cn(props.classNames?.title)}>{props.title}</div>
         <div className={cn(props.classNames?.rightContent)}>{props.rightContent}</div>
      </header>
   )
}

type RootHeaderV2ButtonProps = {
   buttonProps: Omit<ButtonProps, "children">
} & PropsWithChildren

RootHeaderV2.Button = function RootHeaderV2Button(props: RootHeaderV2ButtonProps) {
   return (
      <Button type="text" {...props.buttonProps}>
         {props.children}
      </Button>
   )
}

export default RootHeaderV2
