"use client"

import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { cn } from "@/common/util/cn.util"
import { RightOutlined } from "@ant-design/icons"
import { MapPin, Note } from "@phosphor-icons/react"
import { Badge, Card, Progress, Tag } from "antd"
import { ReactNode, useMemo } from "react"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"

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
   hasCheck?: boolean
}

export default function RequestCard(props: Props) {
   const percentFinished = useMemo(() => {
      if (!props.dto) return 0
      return Math.floor(
         (props.dto.issues?.reduce((acc, prev) => {
            return acc + (prev.status === IssueStatusEnum.RESOLVED ? 1 : 0)
         }, 0) *
            100) /
            props.dto.issues?.length,
      )
   }, [props.dto])

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
               <section className="grid w-full min-w-0 flex-grow grid-cols-12 gap-2">
                  <div className="col-span-8 w-full truncate text-base font-medium text-neutral-700">
                     {props.new && <Badge status="processing" className="mr-1.5" />}
                     {props.machineModelName}
                  </div>
                  <div className="col-span-4 flex items-center justify-end">
                     {props.new && <Tag color="blue-inverse">Mới</Tag>}
                     {props.dto && props.dto.status === FixRequestStatus.IN_PROGRESS && (
                        <div className="mr-2 flex flex-shrink-0 items-center gap-2">
                           <span className="text-xs">Xong {percentFinished} %</span>
                           <Progress
                              type="circle"
                              percent={percentFinished}
                              showInfo={false}
                              size={24}
                              strokeColor="green"
                           />
                        </div>
                     )}

                     {props.status === undefined && !!props.onClick && <RightOutlined />}
                  </div>
               </section>
               <section
                  className={cn(
                     "flex min-w-max flex-col",
                     props.status === undefined && !!props.onClick && "justify-between",
                  )}
               >
                  <div className="flex gap-2">
                     <div className="m-0 flex w-max items-center gap-1 text-sm text-neutral-500">
                        <MapPin size={12} weight="fill" />
                        <div>
                           {props.positionX}x{props.positionY} • {props.area}
                        </div>
                     </div>
                  </div>
                  <div className="mt-1 flex w-max items-center gap-1 text-sm text-neutral-500">
                     <Note size={12} weight="fill" />
                     <div>{props.dto?.requester_note}</div>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between">
                     <div></div>
                     <span className="self-end text-xs font-light text-neutral-600/90">{props.createdDate}</span>
                  </div>
               </section>
            </div>
         </Card>
      </Badge.Ribbon>
   )
}
