import { Badge, Button } from "antd"
import { FilterOutlined, LeftOutlined, MenuOutlined, MoreOutlined } from "@ant-design/icons"
import { ReactNode } from "react"
import { cn } from "@/lib/utils/cn.util"

type Props = {
   prevButton?: ReactNode
   title?: ReactNode
   nextButton?: ReactNode
   className?: string
   classNames?: {
      title?: string
   }
}

function PageHeaderV2(props: Props) {
   return (
      <header
         className={cn("std-layout-outer relative z-50 flex items-center justify-between p-layout", props.className)}
      >
         {props.prevButton ?? <div></div>}
         <h1 className={cn("text-lg font-bold text-white", props.classNames?.title)}>{props.title}</h1>
         {props.nextButton ?? <div></div>}
      </header>
   )
}

type HeaderButtonProps = {
   onClick?: () => void
}
PageHeaderV2.MenuButton = function PageHeaderV2MenuButton(props: HeaderButtonProps) {
   return <Button icon={<MenuOutlined className="text-white" />} type="text" onClick={props.onClick} />
}
PageHeaderV2.BackButton = function PageHeaderV2BackButton(props: HeaderButtonProps) {
   return <Button icon={<LeftOutlined className="text-white" />} type="text" onClick={props.onClick} />
}
PageHeaderV2.InfoButton = function PageHeaderV2InfoButton(props: HeaderButtonProps) {
   return <Button icon={<MoreOutlined className="text-white" />} type="text" onClick={props.onClick} />
}
export default PageHeaderV2
