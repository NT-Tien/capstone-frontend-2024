import { AddressBook, Icon } from "@phosphor-icons/react"
import { Button } from "antd"
import { MoreOutlined } from "@ant-design/icons"
import React, { ReactNode } from "react"
import { cn } from "@/common/util/cn.util"

type Props = {
   icon?: Icon
   title: ReactNode
   className?: string
}

function PageHeader({ icon, ...props }: Props) {
   const RenderIcon = React.createElement(icon || AddressBook, {
      size: 32,
      weight: "fill",
      className: "text-neutral-500",
   })

   return (
      <header className={cn("std-layout py-layout", props.className)}>
         <div className="flex items-center gap-2">
            <div className="rounded-md bg-neutral-200 p-1">{RenderIcon}</div>
            <h1 className="block flex-grow text-xl font-bold text-neutral-700">{props.title}</h1>
            <Button type="text" size="large" icon={<MoreOutlined />}></Button>
         </div>
      </header>
   )
}

export default PageHeader
