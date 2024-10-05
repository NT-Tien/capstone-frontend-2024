import HeadStaff_Device_OneById from "@/features/head-maintenance/api/device/one-byId.api"
import headstaff_qk from "@/features/head-maintenance/qk"
import Issue_ViewDetailsDrawer from "@/features/head-maintenance/components/overlays/Issue_ViewDetails.drawer"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { FixRequestStatusTagMapper } from "@/lib/domain/Request/RequestStatus.enum"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { ArrowRightOutlined } from "@ant-design/icons"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { Badge, Button, Card, Empty, Tag } from "antd"
import { RibbonProps } from "antd/lib/badge/Ribbon"
import { ReactNode, useMemo, useRef } from "react"
import { IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"

type Props = {
   api_task: UseQueryResult<TaskDto, Error>
}

const Can_UpdateIssues = new Set<string>([TaskStatus.AWAITING_FIXER])

export default function IssuesTab(props: Props) {
   const api_device = useQuery({
      queryKey: headstaff_qk.device.byId(props.api_task.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: props.api_task.data?.device.id ?? "" }),
      enabled: props.api_task.isSuccess,
   })

   const sortedIssuesByUpdateDate = useMemo(() => {
      if (!props.api_task.isSuccess) return []

      return props.api_task.data.issues.sort((a, b) => {
         return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      })
   }, [props.api_task.data, props.api_task.isSuccess])

   function IssueCardWithRibbon({
      children,
      ...rest
   }: {
      children: ReactNode
      issue: IssueDto
      badgeProps?: RibbonProps
   }) {
      return (
         <Badge.Ribbon
            text={IssueStatusEnumTagMapper[String(rest.issue.status)].text}
            color={IssueStatusEnumTagMapper[String(rest.issue.status)].color}
         >
            {children}
         </Badge.Ribbon>
      )
   }

   return (
      <section>
         {props.api_task.data?.issues.length === 0 ? (
            <Card>
               <Empty description="Báo cáo chưa có lỗi" />
            </Card>
         ) : (
            <Issue_ViewDetailsDrawer
               drawerProps={{
                  placement: "bottom",
                  height: "100%",
               }}
               showIssueStatus={true}
               refetch={() => {
                  props.api_task.refetch()
                  api_device.refetch()
               }}
            >
               {(handleOpen) => (
                  <div className="space-y-2">
                     {sortedIssuesByUpdateDate.map((item) => (
                        <IssueCardWithRibbon key={item.id} issue={item}>
                           <Card
                              className={cn("w-full border-2 border-neutral-200 bg-transparent p-0 transition-all")}
                              onClick={() => {
                                 api_device.isSuccess &&
                                    handleOpen(
                                       item.id,
                                       api_device.data?.id,
                                       Can_UpdateIssues.has(String(props.api_task.data?.status)),
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
                                       Có {item.issueSpareParts.length} linh kiện
                                    </span>
                                    <Button icon={<ArrowRightOutlined />} size="small" type="text" />
                                 </span>
                              </div>
                           </Card>
                        </IssueCardWithRibbon>
                     ))}
                  </div>
               )}
            </Issue_ViewDetailsDrawer>
         )}
      </section>
   )
}
