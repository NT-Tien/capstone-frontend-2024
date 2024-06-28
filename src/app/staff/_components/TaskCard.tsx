"use client"

import { Avatar, Button, Card, Tooltip, Typography } from "antd"
import { CSSProperties, ReactNode } from "react"
import { InfoOutlined, RightOutlined } from "@ant-design/icons"
import { cn } from "@/common/util/cn.util"

type Props = {
   title: string
   description: string
   priority: boolean
   extra?: ReactNode
   onClick?: () => void
   style?: CSSProperties
   className?: string
   disabled?: boolean
   disabledTooltipText?: string
}

export default function TaskCard(props: Props) {
   return (
      <Tooltip title={props.disabled ? props.disabledTooltipText : ""}>
         <Card
            style={props.style}
            size="small"
            classNames={{
               body: "w-full flex items-center",
            }}
            className={cn(
               props.priority && "border-red-300 bg-red-100",
               props.disabled && "opacity-30",
               props.className,
            )}
            hoverable={!!props.onClick && !props.disabled}
            onClick={() => !props.disabled && props.onClick?.()}
            aria-disabled={!!props.disabled}
         >
            <Avatar
               icon={props.priority ? <InfoOutlined className="" /> : <InfoOutlined className="" />}
               className={props.priority ? "bg-red-500" : "bg-blue-500"}
            />
            <div className="ml-4 flex flex-grow flex-col">
               <Typography.Title level={5} className="mb-0">
                  {props.title}
               </Typography.Title>
               <Typography.Text>{props.description}</Typography.Text>
            </div>
            {props.extra}
            {!!props.onClick && <Button icon={<RightOutlined />} type="text" />}
         </Card>
      </Tooltip>
   )
}
