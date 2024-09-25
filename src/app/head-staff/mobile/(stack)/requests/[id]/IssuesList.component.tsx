import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import { UseQueryResult } from "@tanstack/react-query"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import React, { forwardRef, ReactNode, useMemo, useRef, useState } from "react"
import { Badge, Button, Card, Empty, Skeleton, Tag } from "antd"
import { BaseSelectRef } from "rc-select"
import IssueDetailsDrawer, { IssueDetailsDrawerRefType } from "@/app/head-staff/_components/IssueDetailsDrawer"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { ArrowRightOutlined } from "@ant-design/icons"
import { RibbonProps } from "antd/lib/badge/Ribbon"
import { cn } from "@/lib/utils/cn.util"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { Issue_StatusMapper } from "@/lib/domain/Issue/IssueStatus.mapper"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"

type IssuesListProps = {
   id: string
   api: UseQueryResult<RequestDto, Error>
   device: UseQueryResult<DeviceDto, Error>
   hasScanned: boolean
   className?: string
}

export type IssuesListRefType = {
   focusCreateIssueBtn: () => void
   openCreateIssueDropdown: () => void
}

const IssuesList = function Component(props: IssuesListProps) {
   const issueDetailsDrawerRef = useRef<IssueDetailsDrawerRefType | null>(null)
   const createIssueBtnRef = useRef<BaseSelectRef | null>(null)
   const createIssueBtnWrapperRef = useRef<HTMLDivElement | null>(null)

   const [highlightedId, setHighlightedId] = useState<undefined | string>()

   const sortedIssuesByUpdateDate = useMemo(() => {
      if (!props.api.isSuccess) return []

      return props.api.data.issues.sort((a, b) => {
         return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      })
   }, [props.api.data, props.api.isSuccess])

   function IssueCardWithRibbon({
      children,
      ...rest
   }: {
      children: ReactNode
      issue: IssueDto
      badgeProps?: RibbonProps
   }) {
      if (props.api.isPending) return children

      if (rest.issue.id === highlightedId) {
         return (
            <Badge.Ribbon text="Mới" color="green">
               {children}
            </Badge.Ribbon>
         )
      }

      if (
         props.api.data?.status === FixRequestStatus.PENDING ||
         props.api.data?.status === FixRequestStatus.APPROVED ||
         props.api.data?.status === FixRequestStatus.IN_PROGRESS
      ) {
         if (rest.issue.task === null) {
            return <Badge.Ribbon text="Chưa có tác vụ">{children}</Badge.Ribbon>
         }

         return (
            <Badge.Ribbon text={Issue_StatusMapper(rest.issue)?.text} color={Issue_StatusMapper(rest.issue)?.color}>
               {children}
            </Badge.Ribbon>
         )
      }

      return children
   }

   return (
      <section className={props.className}>
         <h2 className="mb-2 text-base font-semibold">Các lỗi thiết bị</h2>
         {props.api.isSuccess ? (
            <>
               {props.api.data.issues.length === 0 ? (
                  <Card>
                     <Empty description="Báo cáo chưa có lỗi" />
                  </Card>
               ) : (
                  <IssueDetailsDrawer
                     drawerProps={{
                        placement: "bottom",
                        height: "100%",
                     }}
                     showIssueStatus={props.api.data.status !== FixRequestStatus.PENDING}
                     refetch={props.api.refetch}
                     ref={issueDetailsDrawerRef}
                  >
                     {(handleOpen) => (
                        <div className="space-y-2">
                           {sortedIssuesByUpdateDate.map((item) => (
                              <IssueCardWithRibbon key={item.id} issue={item}>
                                 <Card
                                    className={cn(
                                       "w-full border-2 border-neutral-200 bg-transparent p-0 transition-all",
                                       item.id === highlightedId && "border-green-200 bg-green-50",
                                    )}
                                    onClick={() => {
                                       props.device.isSuccess &&
                                          props.api.isSuccess &&
                                          handleOpen(
                                             item.id,
                                             props.device.data.id,
                                             /**
                                              * Only show actions if
                                              * - User has scanned
                                              * - and either [Status is PENDING, CHECKED]
                                              * - or [Status is IN_PROGRESS with either no task or task status is AWAITING_FIXER]
                                              */
                                             props.hasScanned &&
                                                (new Set([FixRequestStatus.PENDING]).has(props.api.data.status) ||
                                                   (new Set([
                                                      FixRequestStatus.IN_PROGRESS,
                                                      FixRequestStatus.APPROVED,
                                                   ]).has(props.api.data.status) &&
                                                      (item.task === null ||
                                                         item.task.status === TaskStatus.AWAITING_FIXER))),
                                          )
                                    }}
                                    hoverable
                                    classNames={{
                                       body: "flex p-2.5 items-center",
                                    }}
                                 >
                                    <div className="flex flex-grow flex-col">
                                       <h3 className="font-medium">{item.typeError.name}</h3>
                                       <span className={"mt-1 flex w-full items-center gap-1"}>
                                          <Tag color={FixTypeTagMapper[String(item.fixType)].colorInverse}>
                                             {FixTypeTagMapper[String(item.fixType)].text}
                                          </Tag>
                                          <span className="w-52 flex-grow truncate text-neutral-400">
                                             {item.issueSpareParts.length === 0
                                                ? "Chưa có linh kiện"
                                                : `Có ${item.issueSpareParts.length} linh kiện`}
                                          </span>
                                          <Button icon={<ArrowRightOutlined />} size="small" type="text"></Button>
                                       </span>
                                    </div>
                                 </Card>
                              </IssueCardWithRibbon>
                           ))}
                        </div>
                     )}
                  </IssueDetailsDrawer>
               )}
            </>
         ) : (
            <>{props.api.isPending && <Skeleton.Button />}</>
         )}
      </section>
   )
}

export default IssuesList
