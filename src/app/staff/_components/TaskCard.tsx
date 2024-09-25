"use client"

import { Avatar, Button, Card, Tooltip, Typography } from "antd"
import { CSSProperties, ReactNode } from "react"
import { InfoOutlined, RightOutlined } from "@ant-design/icons"
import { cn } from "@/lib/utils/cn.util"

type Props = {
   title: string
   description: string
   priority?: boolean
   extra?: ReactNode
   onClick?: () => void
   style?: CSSProperties
   className?: string
   bottom?: ReactNode
   disabled?: boolean
   disabledTooltipText?: string
}

export default function TaskCard(props: Props) {
   return (
      <Tooltip title={props.disabled ? props.disabledTooltipText : ""}>
         <Card
            style={props.style}
            size="small"
            className={cn(
               props.priority && "border-red-300 bg-red-100",
               props.disabled && "opacity-30",
               props.className,
            )}
            hoverable={!!props.onClick && !props.disabled}
            onClick={() => !props.disabled && props.onClick?.()}
            aria-disabled={!!props.disabled}
         >
            <div className="flex flex-col">
               <div className="flex items-center">
                  <Avatar
                     icon={props.priority ? <InfoOutlined className="" /> : <InfoOutlined className="" />}
                     className={cn(props.priority ? "bg-red-500" : "bg-blue-500", "aspect-square")}
                  />
                  <div className="ml-4 flex flex-grow flex-col">
                     <Typography.Title level={5} className="mb-0 w-48" ellipsis={true}>
                        {props.title}
                     </Typography.Title>
                     <Typography.Text>{props.description}</Typography.Text>
                  </div>
                  {props.extra}
                  {!!props.onClick && <Button icon={<RightOutlined />} type="text" />}
               </div>
               <section className="mt-1 w-full">{props.bottom}</section>
            </div>
         </Card>
      </Tooltip>
   )
}
