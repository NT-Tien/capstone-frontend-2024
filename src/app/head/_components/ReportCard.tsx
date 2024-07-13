// "use client"

import { Card, Tag } from "antd"
import React, { ReactNode } from "react"
import extended_dayjs from "@/config/dayjs.config"
import { cn } from "@/common/util/cn.util"
import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"
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
   status?: IssueRequestStatus
   positionX: number
   positionY: number
   area: string
   onClick?: (id: string) => void
   index: number
}

export default function ReportCard(props: Props) {
   const { t } = useTranslation()
   const backgroundColor = props.index % 2 === 0 ? "bg-blue-100" : "bg-white"
   const tagColor =
      props.status === IssueRequestStatus.PENDING
         ? "blue"
         : props.status === IssueRequestStatus.APPROVED
           ? "#006400"
           : "gray"

   const borderTagColor =
      props.status === IssueRequestStatus.PENDING
         ? "blue"
         : props.status === IssueRequestStatus.APPROVED
           ? "#006400"
           : "gray"
   const backgroundTagColor =
      props.status === IssueRequestStatus.PENDING
         ? "#ebebff"
         : props.status === IssueRequestStatus.APPROVED
           ? "#f0faf0"
           : "#FAFAFA"

   return (
      <Card
         classNames={{
            body: "flex",
         }}
         className={cn(
            backgroundColor,
            (function () {
               switch (props.status) {
                  case IssueRequestStatus.PENDING:
                     return "border-gray-300 bg-gray-100"
                  case IssueRequestStatus.APPROVED:
                     return "bg-white-100 border-gray-300"
                  case IssueRequestStatus.REJECTED:
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
         <section className="mr-3 flex w-full min-w-0 max-w-xs flex-grow flex-col gap-1">
            <div className="truncate text-base font-semibold">{props.machineModelName}</div>
            <div className="flex items-center gap-1">
               <MapPin weight="fill" />
               <span>
                  {props.area} ({props.positionX}x{props.positionY})
               </span>
            </div>
         </section>
         <section className="flex w-max min-w-max flex-col items-end justify-between">
            {props.status ? (
               <Tag
                  className="m-0"
                  style={{ color: tagColor, borderColor: borderTagColor, backgroundColor: backgroundTagColor }}
               >
                  {props.status}
               </Tag>
            ) : !!props.onClick ? (
               <div className="flex w-max min-w-20 items-center justify-end gap-2 opacity-60">
                  <span className="text-sm">{t("Details")}</span>
                  <RightOutlined />
               </div>
            ) : (
               <div className="w-16"></div>
            )}
            <span className="text-xs">{props.createdDate}</span>
         </section>
      </Card>
   )
}
