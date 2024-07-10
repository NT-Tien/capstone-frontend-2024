"use client"

import { Button, ButtonProps } from "antd"
import { ContainerFilled } from "@ant-design/icons"
import { CSSProperties, ReactNode } from "react"
import { cn } from "@/common/util/cn.util"
import LocaleSwitcher from "@/common/components/LocaleSwitcher"

type Props = {
   title: string
   icon?: JSX.Element
   onIconClick?: () => void
   style?: CSSProperties
   buttonProps?: Omit<ButtonProps, "onClick">
   className?: string
}

export default function RootHeader({
   title,
   style,
   onIconClick,
   buttonProps,
   icon = <ContainerFilled className="text-lg" />,
   className,
}: Props) {
   return (
      <div className={cn("flex h-min w-full items-center justify-between bg-white", className)} style={style}>
         <span className="flex flex-grow items-center gap-1 text-xl font-semibold">
            <Button icon={icon} type="text" className="p-0" onClick={onIconClick} {...buttonProps} />
            {title}
         </span>
         <div className="">
            <LocaleSwitcher />
         </div>
      </div>
   )
}
