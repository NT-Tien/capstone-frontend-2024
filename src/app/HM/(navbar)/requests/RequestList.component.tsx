"use client"

import { useRouter } from "next/navigation"
import { Avatar, List, Tag } from "antd"
import generateAvatarData from "@/lib/utils/generateAvatarData.util"
import { cn } from "@/lib/utils/cn.util"
import DataGrid from "@/components/DataGrid"
import { CalendarBlank, CheckSquare, MapPinArea, Pen, Truck, Warning } from "@phosphor-icons/react"
import dayjs from "dayjs"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { RightOutlined } from "@ant-design/icons"
import hm_uris from "@/features/head-maintenance/uri"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

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
         case FixRequestStatus.APPROVED:
         case FixRequestStatus.IN_PROGRESS:
         case FixRequestStatus.HEAD_CONFIRM:
            if (request.is_warranty === true) {
               router.push(hm_uris.stack.requests_id_warranty(request.id))
               break
            }

            if (request.is_renew === true) {
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
            return (
               <List.Item
                  className={cn(
                     "w-full px-layout",
                     index === 0 && "mt-0",
                     index % 2 === 0 && item.is_seen && "bg-neutral-100",
                     !item.is_seen && index % 2 === 0 && "bg-green-200",
                     !item.is_seen && index % 2 === 1 && "bg-green-100",
                  )}
                  onClick={() => handleGotoDetails(item)}
               >
                  <List.Item.Meta
                     className="head_department_history_list mb-4"
                     avatar={<Avatar className={cn(avatarData.color)}>{avatarData.content}</Avatar>}
                     title={
                        <div className="truncate text-base">
                           {!item.is_seen && <Tag color={"green-inverse"}>Mới</Tag>}
                           {item.device.machineModel.name}
                        </div>
                     }
                     description={
                        <div className="truncate text-sm">
                           {item.requester.username} | {item.requester_note}
                        </div>
                     }
                  ></List.Item.Meta>
                  <div className="flex items-end">
                     <DataGrid
                        spaceProps={{
                           split: undefined,
                        }}
                        className="flex-grow text-xs text-neutral-500"
                        items={[
                           {
                              value: (
                                 <>
                                    {item.device.area.name}{" "}
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
                              value: `${item.issues?.length ?? 0} lỗi`,
                              icon: <Warning size={16} weight={"duotone"} />,
                              hidden: !new Set([FixRequestStatus.APPROVED, FixRequestStatus.IN_PROGRESS]).has(
                                 item.status,
                              ),
                           },
                           {
                              value: `Lý do: ${item.checker_note ?? "-"}`,
                              icon: <Warning size={16} weight={"duotone"} />,
                              hidden: !new Set([FixRequestStatus.REJECTED]).has(item.status),
                           },
                           {
                              value: `${item.tasks?.length ?? 0} tác vụ`,
                              icon: <CheckSquare size={16} weight={"duotone"} />,
                              hidden: !new Set([FixRequestStatus.APPROVED, FixRequestStatus.IN_PROGRESS]).has(
                                 item.status,
                              ),
                           },
                           {
                              value: (
                                 <div className={"w-32 truncate"}>
                                    {item.status === FixRequestStatus.HEAD_CONFIRM
                                       ? "Chưa đánh giá"
                                       : `Đánh giá: ${item.feedback?.content ?? "-"}`}
                                 </div>
                              ),
                              icon: <Pen size={16} weight={"duotone"} />,
                              hidden: !new Set([FixRequestStatus.HEAD_CONFIRM, FixRequestStatus.CLOSED]).has(
                                 item.status,
                              ),
                           },
                           {
                              icon: <Truck size={16} weight="duotone" />,
                              value: "Bảo hành",
                              hidden: !item.is_warranty,
                              className: "text-orange-500",
                           },
                        ]}
                        cols={2}
                     />
                     <RightOutlined className="text-xs text-neutral-500" />
                  </div>
               </List.Item>
            )
         }}
      />
   )
}

export default RequestList
