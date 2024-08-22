import { cn } from "@/common/util/cn.util"
import { MoreOutlined } from "@ant-design/icons"
import { AddressBook, CaretLeft, Icon, IconProps } from "@phosphor-icons/react"
import Button from "antd/es/button"
import React, { ReactNode } from "react"

type Props = {
   icon?: Icon
   iconProps?: IconProps
   title: ReactNode
   className?: string
   handleClickIcon?: () => void
}

function PageHeader({ icon, title, className, handleClickIcon, iconProps }: Props) {
   const RenderIcon = React.createElement(icon || AddressBook, {
      size: 24,
      weight: icon === PageHeader.BackIcon ? "bold" : "fill",
      className: "text-neutral-500",
      ...iconProps
   })

   function handleClickIconWrapper() {
      handleClickIcon?.()
   }

   return (
      <header className={cn("std-layout py-layout", className)}>
         <div className="flex items-center gap-3">
            <Button className="bg-neutral-100/50 p-2" classNames={{
               icon: ""
            }} icon={RenderIcon} onClick={handleClickIconWrapper}></Button>
            <h1 className="block flex-grow text-xl font-bold text-neutral-600">{title}</h1>
            <Button type="text" size="large" icon={<MoreOutlined />}></Button>
         </div>
      </header>
   )
}

PageHeader.BackIcon = CaretLeft

export default PageHeader
