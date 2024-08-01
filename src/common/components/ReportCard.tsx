"use client"

import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { cn } from "@/common/util/cn.util"
import { RightOutlined } from "@ant-design/icons"
import { MapPin } from "@phosphor-icons/react"
import { Badge, Card, Tag } from "antd"
import { ReactNode } from "react"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"

/**
 * Show:
 * - Name of Machine Model in Report
 * - Report Created Date
 * - Report Status (optional)
 * - Device Position
 * - Device Area
 */
type Props = {
   id: string
   machineModelName: string
   createdDate: ReactNode
   status?: FixRequestStatus
   positionX: number
   positionY: number
   note?: string
   area: string
   onClick?: (id: string) => void
   index: number
   className?: string
   new?: boolean
   requester?: string
   dto?: FixRequestDto
}

export default function ReportCard(props: Props) {
   return (
      <Badge.Ribbon
         style={{
            display: props.status ? "block" : "none",
         }}
         color={FixRequest_StatusMapper(props.dto).color}
         text={<div className="text-sm capitalize">{FixRequest_StatusMapper(props.dto).text}</div>}
      >
         <Card
            className={cn(
               props.className,
               (function () {
                  switch (props.status) {
                     case FixRequestStatus.PENDING:
                        return "border-gray-300 bg-gray-100"
                     case FixRequestStatus.APPROVED:
                        return "bg-white-100 border-gray-300"
                     case FixRequestStatus.REJECTED:
                        return "border-red-300 bg-red-100"
                     default:
                        return ""
                  }
               })(),
               props.new ? "border-l-4 border-primary-400 bg-primary-50" : "border-gray-300 bg-white",
            )}
            size="small"
            hoverable={!!props.onClick}
            onClick={() => props.onClick?.(props.id)}
         >
            <div className="flex w-full flex-col gap-1">
               <section className="flex w-full min-w-0 flex-grow gap-2">
                  <div className="w-full truncate text-base font-medium text-neutral-700">
                     {props.new && <Badge status="processing" className="mr-1.5" />}
                     {props.machineModelName}
                  </div>
                  <div className="flex items-center">
                     {props.new && <Tag color="blue-inverse">Mới</Tag>}
                     {props.status === undefined && !!props.onClick && <RightOutlined />}
                  </div>
               </section>
               <section
                  className={cn(
                     "flex min-w-max flex-col",
                     props.status === undefined && !!props.onClick && "justify-between",
                  )}
               >
                  <div className="flex items-start gap-1 text-sm font-light text-neutral-700">
                     <MapPin size={14} weight="fill" className="mt-[2px]" />
                     <div>
                        <span className="text-sm">
                           {props.area} ({props.positionX}x{props.positionY})
                        </span>
                     </div>
                  </div>
                  <span className="mt-1 text-right text-xs font-light text-neutral-600/90">{props.createdDate}</span>
               </section>
            </div>
         </Card>
      </Badge.Ribbon>
   )
}
