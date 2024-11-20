import { Badge, Button, ButtonProps } from "antd"
import { FilterOutlined, LeftOutlined, MenuOutlined, MoreOutlined } from "@ant-design/icons"
import { createContext, ReactNode, useContext } from "react"
import { cn } from "@/lib/utils/cn.util"

type Props = {
   prevButton?: ReactNode
   title?: ReactNode
   nextButton?: ReactNode
   className?: string
   classNames?: {
      title?: string
   }
   type?: "dark" | "light"
}

const PageHeaderV2Context = createContext<Props | null>(null)

function PageHeaderV2(props: Props) {
   return (
      <PageHeaderV2Context.Provider value={props}>
         <header
            className={cn(
               "std-layout-outer relative z-50 flex items-center justify-between p-layout",
               props.type === "dark" ? "text-black" : "text-white",
               props.className,
            )}
         >
            {props.prevButton ?? <div className='size-8'></div>}
            <h1 className={cn("text-lg font-bold", props.classNames?.title)}>{props.title}</h1>
            {props.nextButton ?? <div className='size-8'></div>}
         </header>
      </PageHeaderV2Context.Provider>
   )
}

type HeaderButtonProps = {
   onClick?: () => void
   buttonProps?: ButtonProps
}
PageHeaderV2.MenuButton = function PageHeaderV2MenuButton(props: HeaderButtonProps) {
   const context = useContext(PageHeaderV2Context)

   return (
      <Button
         icon={<MenuOutlined className={cn(context?.type === "dark" ? "text-black" : "text-white")} />}
         type="text"
         onClick={props.onClick}
         {...props.buttonProps}
      />
   )
}
PageHeaderV2.BackButton = function PageHeaderV2BackButton(props: HeaderButtonProps) {
   const context = useContext(PageHeaderV2Context)

   return (
      <Button
         icon={<LeftOutlined className={cn(context?.type === "dark" ? "text-black" : "text-white")} />}
         type="text"
         onClick={props.onClick}
         {...props.buttonProps}
      />
   )
}
PageHeaderV2.InfoButton = function PageHeaderV2InfoButton(props: HeaderButtonProps) {
   const context = useContext(PageHeaderV2Context)

   return (
      <Button
         icon={<MoreOutlined className={cn(context?.type === "dark" ? "text-black" : "text-white")} />}
         type="text"
         onClick={props.onClick}
         {...props.buttonProps}
      />
   )
}
export default PageHeaderV2
