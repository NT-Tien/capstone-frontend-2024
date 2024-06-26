"use client"

import { Button, ButtonProps } from "antd"
import { ContainerFilled, MenuOutlined } from "@ant-design/icons"
import { CSSProperties } from "react"
import { cn } from "@/common/util/cn.util"

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
      <div className={cn("flex h-min w-full items-center justify-between bg-[#FEF7FF]", className)} style={style}>
         <span className="mb-0 flex items-center gap-3 text-xl font-semibold">
            {onIconClick ? <Button icon={icon} type="text" onClick={onIconClick} {...buttonProps} /> : icon}
            {title}
         </span>
         <Button type="text" icon={<MenuOutlined />} />
      </div>
   )
}
