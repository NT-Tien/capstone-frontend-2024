"use client"

import { Button } from "antd"
import { ContainerFilled, MenuOutlined } from "@ant-design/icons"
import { CSSProperties } from "react"

type Props = {
   title: string
   icon?: JSX.Element
   onIconClick?: () => void
   style?: CSSProperties
}

export default function HeadStaffRootHeader({
   title,
   style,
   onIconClick,
   icon = <ContainerFilled className="text-lg" />,
}: Props) {
   return (
      <div className="flex w-full items-center justify-between bg-[#FEF7FF]" style={style}>
         <span className="mb-0 flex items-center gap-3 text-xl font-semibold">
            {onIconClick ? <Button icon={icon} type="default" onClick={onIconClick} /> : icon}
            {title}
         </span>
         <Button type="text" icon={<MenuOutlined />} />
      </div>
   )
}
