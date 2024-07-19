"use client"

import { Badge, Card, Tag } from "antd"
import React, { ReactNode } from "react"
import extended_dayjs from "@/config/dayjs.config"
import { cn } from "@/common/util/cn.util"
import { FixRequestStatus, FixRequestStatusTagMapper } from "@/common/enum/issue-request-status.enum"
import { MapPin } from "@phosphor-icons/react"
import { RightOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"

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
}

export default function ReportCard(props: Props) {
   const { t } = useTranslation()
   const backgroundColor = props.index % 2 === 0 ? "bg-neutral-200" : "bg-white"

   return (
      <Badge.Ribbon
         style={{
            display: props.status ? "block" : "none",
         }}
         color={props.status ? FixRequestStatusTagMapper[String(props.status)].color : undefined}
         text={<div className="text-sm capitalize">{props.status?.toLowerCase()}</div>}
      >
         <Card
            className={cn(
               backgroundColor,
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
                        return "border-gray-300"
                  }
               })(),
            )}
            size="small"
            hoverable={!!props.onClick}
            onClick={() => props.onClick?.(props.id)}
         >
            <div className="flex w-full justify-between">
               <section className="mr-1 flex w-full min-w-0 max-w-xs flex-grow flex-col gap-2">
                  <div className="truncate text-base font-medium text-neutral-700">{props.machineModelName}</div>
                  <div className="flex items-start gap-1 text-sm font-light text-neutral-700">
                     <MapPin size={14} weight="fill" className="mt-[2px]" />
                     <div>
                        <span className="text-sm">
                           {props.area} ({props.positionX}x{props.positionY})
                        </span>
                     </div>
                  </div>
               </section>
               <section
                  className={cn(
                     "flex min-w-max flex-col items-end justify-end",
                     props.status === undefined && !!props.onClick && "justify-between",
                  )}
               >
                  {props.status === undefined && !!props.onClick && (
                     <div className="flex w-max min-w-20 items-center justify-end gap-2 opacity-60">
                        <RightOutlined />
                     </div>
                  )}
                  <span className="text-right text-xs font-light text-neutral-600/90">{props.createdDate}</span>
               </section>
            </div>
         </Card>
      </Badge.Ribbon>
   )
}
