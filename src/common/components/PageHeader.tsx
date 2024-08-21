import { AddressBook, CaretLeft, Icon } from "@phosphor-icons/react"
import { Button } from "antd"
import { MoreOutlined } from "@ant-design/icons"
import React, { ReactNode } from "react"
import { cn } from "@/common/util/cn.util"
import { useRouter } from "next/navigation"

type Props = {
   icon?: Icon
   title: ReactNode
   className?: string
   handleBack?: () => void
}

function PageHeader({ icon, title, className, handleBack }: Props) {
   const router = useRouter()
   const handleBackClick = () => {
      if (handleBack) {
         handleBack()
      } else {
         router.back()
      }
   }
   const RenderIcon = React.createElement(icon || AddressBook, {
      size: 32,
      weight: "fill",
      className: "text-neutral-500",
   })

   return (
      <header className={cn("std-layout py-layout", className)}>
         <div className="flex items-center gap-2">
            {handleBack && (
               <Button
                  type="text"
                  size="large"
                  onClick={handleBackClick}
                  icon={<CaretLeft size={32} weight="fill" className="text-neutral-500" />}
               />
            )}
            {!handleBack && <div className="rounded-md bg-neutral-200 p-1">{RenderIcon}</div>}
            <h1 className="block flex-grow text-xl font-bold text-neutral-700">{title}</h1>
            <Button type="text" size="large" icon={<MoreOutlined />}></Button>
         </div>
      </header>
   )
}

export default PageHeader
