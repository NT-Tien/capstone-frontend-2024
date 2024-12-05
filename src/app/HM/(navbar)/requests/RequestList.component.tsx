"use client"

import ClickableArea from "@/components/ClickableArea"
import DataGrid from "@/components/DataGrid"
import hm_uris from "@/features/head-maintenance/uri"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { cn } from "@/lib/utils/cn.util"
import generateAvatarData from "@/lib/utils/generateAvatarData.util"
import { RightOutlined } from "@ant-design/icons"
import { CalendarBlank, CheckSquare, MapPinArea, Pen, Swap, Truck, Warning, Wrench } from "@phosphor-icons/react"
import { Avatar, Divider, List, Progress, Tag } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"

type Props = {
   requests: RequestDto[]
}

function RequestList(props: Props) {
   const router = useRouter()

   function handleGotoDetails(request: RequestDto) {
      switch (request.status) {
         case FixRequestStatus.PENDING:
         case FixRequestStatus.HEAD_CANCEL:
         case FixRequestStatus.REJECTED:
            router.push(hm_uris.stack.requests_id(request.id))
            break
         case FixRequestStatus.HM_VERIFY:
         case FixRequestStatus.CLOSED:
         case FixRequestStatus.APPROVED:
         case FixRequestStatus.IN_PROGRESS:
         case FixRequestStatus.HEAD_CONFIRM:
            if (request.is_warranty === true) {
               router.push(hm_uris.stack.requests_id_warranty(request.id))
               break
            }

            if (request.is_rennew === true) {
               router.push(hm_uris.stack.requests_id_renew(request.id))
               break
            }

            router.push(hm_uris.stack.requests_id_fix(request.id))
      }
   }

   return (
      <List
         rowKey={"id"}
         split
         className={"std-layout-outer"}
         dataSource={props.requests}
         itemLayout={"vertical"}
         renderItem={(item, index) => {
            const avatarData = generateAvatarData(item.device.machineModel.name)
            const percentFinished =
               Math.floor(
                  item.issues.filter(
                     (i) => i.status === IssueStatusEnum.RESOLVED || i.status === IssueStatusEnum.CANCELLED,
                  ).length / item.issues.length,
               ) * 100

            const percentFailed =
               Math.floor(item.issues.filter((i) => i.status === IssueStatusEnum.FAILED).length / item.issues.length) *
               100
            return (
               <ClickableArea className="block w-full" reset onClick={() => handleGotoDetails(item)}>
                  <List.Item
                     className={cn(
                        "w-full px-layout",
                        index === 0 && "mt-0",
                        index % 2 === 0 && item.is_seen && "bg-neutral-100",
                        !item.is_seen && index % 2 === 0 && "bg-green-200",
                        !item.is_seen && index % 2 === 1 && "bg-green-100",
                     )}
                  >
                     <List.Item.Meta
                        className="head_department_history_list mb-4"
                        avatar={<Avatar className={cn(avatarData.color)}>{avatarData.content}</Avatar>}
                        title={
                           <div className="truncate text-base">
                              {!item.is_seen && <Tag color={"green-inverse"}>Mới</Tag>}
                              # {item.code}
                           </div>
                        }
                        description={
                           <div className="flex w-full items-center gap-2 text-sm">
                              <div>{item.requester.username}</div>
                              <Divider type="vertical" className="m-0" />
                              <div className="truncate">{item.device.machineModel.name}</div>
                           </div>
                        }
                     ></List.Item.Meta>
                     <div className="flex items-end">
                        <div className={"w-full"}>
                           <DataGrid
                              spaceProps={{
                                 split: undefined,
                              }}
                              className="flex-grow text-xs text-neutral-500"
                              items={[
                                 {
                                    value: (
                                       <>
                                          {item.device?.area?.name}{" "}
                                          {item.device.positionX && item.device.positionY
                                             ? `(${item.device.positionX}, ${item.device.positionY})`
                                             : ""}
                                       </>
                                    ),
                                    icon: <MapPinArea size={16} weight="duotone" />,
                                 },
                                 {
                                    value: dayjs(item.createdAt).format("DD/MM/YYYY"),
                                    icon: <CalendarBlank size={16} weight="duotone" />,
                                    className: "text-head_department",
                                 },
                                 {
                                    icon: <Truck size={16} weight="duotone" />,
                                    value: "Bảo hành",
                                    hidden: !item.is_warranty,
                                    className: "text-orange-500",
                                 },
                                 {
                                    icon: <Swap size={16} weight="duotone" />,
                                    value: "Thay máy",
                                    hidden: !item.is_rennew,
                                    className: "text-purple-500",
                                 },
                                 {
                                    icon: <Wrench size={16} weight="duotone" />,
                                    value: "Sửa chữa",
                                    hidden: !item.is_fix,
                                    className: "text-blue-500",
                                 },
                                 {
                                    value: `Lý do: ${item.checker_note ?? "-"}`,
                                    icon: <Warning size={16} weight={"duotone"} />,
                                    hidden: !new Set([FixRequestStatus.REJECTED]).has(item.status),
                                 },
                                 {
                                    value: `${item.tasks.filter((t) => TaskUtil.isTask_Running(t)).length ?? 0} tác vụ`,
                                    icon: <CheckSquare size={16} weight={"duotone"} />,
                                    hidden: !new Set([FixRequestStatus.APPROVED, FixRequestStatus.IN_PROGRESS]).has(
                                       item.status,
                                    ),
                                 },
                                 {
                                    value: (
                                       <div className={"w-32 truncate"}>
                                          {item.status === FixRequestStatus.HEAD_CONFIRM && item.feedback?.length === 0
                                             ? "Chưa đánh giá"
                                             : "Đã đánh giá"}
                                       </div>
                                    ),
                                    icon: <Pen size={16} weight={"duotone"} />,
                                    hidden: !new Set([FixRequestStatus.HEAD_CONFIRM, FixRequestStatus.CLOSED]).has(
                                       item.status,
                                    ),
                                 },
                              ]}
                              cols={2}
                           />
                           {item.status === FixRequestStatus.IN_PROGRESS && (
                              <Progress
                                 percent={percentFailed}
                                 strokeColor={"rgb(112, 0, 0)"}
                                 success={{ percent: percentFinished, strokeColor: "rgb(3, 83, 18)" }}
                                 size={"small"}
                                 className={"mt-1 pr-2"}
                              />
                           )}
                        </div>
                        <RightOutlined className="pb-1 text-xs text-neutral-500" />
                     </div>
                  </List.Item>
               </ClickableArea>
            )
         }}
      />
   )
}

export default RequestList
