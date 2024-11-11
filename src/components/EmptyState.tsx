import { cn } from "@/lib/utils/cn.util"
import { Button, ButtonProps, Divider, Space } from "antd"
import Image from "next/image"
import { ReactNode } from "react"

type Props = {
   image?: ReactNode
   className?: string
   title?: string
   description?: string
   actions?: ReactNode[]
}

function EmptyState(props: Props) {
   return (
      <div className={cn("flex min-h-64 flex-col items-center justify-center", props.className)}>
         {props.image || <EmptyState.ImageDefault />}
         <h1 className="text-lg font-bold text-center">{props.title ?? "Không có dữ liệu"}</h1>
         <p className="text-gray-500 text-center">{props.description ?? "Hiện tại không có dữ liệu trong hệ thống"}</p>
         {props.actions && (
            <Space split={<Divider type="vertical" className="m-0" />} wrap className="mt-3">
               {props.actions.map((action, index) => (
                  <div key={index}>{action}</div>
               ))}
            </Space>
         )}
      </div>
   )
}

EmptyState.ImageDefault = function EmptyStateImageDefault() {
   return <Image src="/empty-image.svg" width={200} height={200} alt="icon" />
}

EmptyState.ActionButton = function EmptyStateActionButton(props: ButtonProps) {
   return <Button type="link" size="small" {...props}></Button>
}

export default EmptyState
