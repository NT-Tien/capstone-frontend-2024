import { cn } from "@/lib/utils/cn.util"
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
   const RenderIcon = icon
      ? React.createElement(icon, {
           size: 24,
           weight: icon === PageHeader.BackIcon ? "bold" : "fill",
           className: "text-neutral-500",
           ...iconProps,
        })
      : null

   function handleClickIconWrapper() {
      handleClickIcon?.()
   }

   return (
      <header className={cn("w-full px-layout py-layout", className)}>
         <div className="flex w-full items-center justify-between">
            <Button
               className="bg-neutral-100/50 p-2"
               classNames={{
                  icon: "",
               }}
               icon={RenderIcon}
               onClick={handleClickIconWrapper}
            ></Button>
            <h1 className="flex w-full justify-center text-center text-2xl font-bold text-neutral-600">{title}</h1>
         </div>
      </header>
   )
}

PageHeader.BackIcon = CaretLeft

export default PageHeader
