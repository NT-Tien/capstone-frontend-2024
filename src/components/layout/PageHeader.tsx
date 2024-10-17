import { cn } from "@/lib/utils/cn.util"
import { CaretLeft, Icon, IconProps, List } from "@phosphor-icons/react"
import Button from "antd/es/button"
import React, { ReactNode } from "react"
import { MoreOutlined } from "@ant-design/icons"

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
           weight: icon === PageHeader.BackIcon ? "bold" : icon === PageHeader.NavIcon ? "regular" : "fill",
           className: "text-neutral-500",
           ...iconProps,
        })
      : null

   function handleClickIconWrapper() {
      console.log("Hello")
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
               disabled={false}
            ></Button>
            <h1 className="flex w-full justify-center text-center text-xl font-bold text-neutral-600">{title}</h1>
            <Button className="bg-neutral-100/50 p-2" icon={<MoreOutlined />}></Button>
         </div>
      </header>
   )
}

PageHeader.BackIcon = CaretLeft
PageHeader.NavIcon = List

export default PageHeader
