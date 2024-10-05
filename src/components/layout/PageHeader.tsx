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
   const RenderIcon = React.createElement(icon || AddressBook, {
      size: 24,
      weight: icon === PageHeader.BackIcon ? "bold" : "fill",
      className: "text-neutral-500",
      ...iconProps,
   })

   function handleClickIconWrapper() {
      handleClickIcon?.()
   }

   return (
      <header className={cn("px-layout py-layout w-full", className)}>
         <div className="flex justify-between items-center w-full">
            <Button
               className="bg-neutral-100/50 p-2"
               classNames={{
                  icon: "",
               }}
               icon={RenderIcon}
               onClick={handleClickIconWrapper}
            ></Button>
            <h1 className="flex justify-center w-full text-center text-2xl font-bold text-neutral-600">{title}</h1>
            {/* <Button type="text" size="large" icon={<MoreOutlined />}></Button> */}
         </div>
      </header>
   )
}

PageHeader.BackIcon = CaretLeft

export default PageHeader
