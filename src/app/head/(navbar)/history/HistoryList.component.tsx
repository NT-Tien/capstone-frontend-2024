import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { Avatar, Button, Card, Divider, List, Result, Skeleton, Space, Tag } from "antd"
import { RightOutlined, TruckFilled } from "@ant-design/icons"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import useRequest_AllQuery from "@/features/head-department/queries/Request_All.query"
import RequestCard from "@/features/head-maintenance/components/RequestCard"
import hd_uris from "@/features/head-department/uri"
import generateAvatarData from "@/lib/utils/generateAvatarData.util"
import { Calendar, CalendarBlank, CheckCircle, MapPinArea, Truck, User } from "@phosphor-icons/react"
import DataGrid from "@/components/DataGrid"

type Props = {
   requests: RequestDto[] | undefined
}

function HistoryList({ requests }: Props) {
   const router = useRouter()
   const api_requests = useRequest_AllQuery({})

   if (!api_requests.isSuccess) {
      if (api_requests.isPending) {
         return <Skeleton className="mt-layout" active />
      }

      if (api_requests.isError) {
         return (
            <Card className="mt-layout">
               <Result
                  title="Có lỗi xảy ra"
                  subTitle="Vui lòng thử lại sau"
                  extra={<Button onClick={() => api_requests.refetch()}>Thử lại</Button>}
               />
            </Card>
         )
      }
   }
   if (!requests) {
      return <Skeleton className="mt-layout" active />
   }

   if (requests.length === 0) {
      return (
         <Card className="mt-layout">
            <Result title="Không có yêu cầu nào" subTitle="Hiện tại không có yêu cầu nào thuộc trạng thái này." />
         </Card>
      )
   }

   return (
      <List
         rowKey="id"
         split
         className="std-layout-outer"
         dataSource={requests}
         itemLayout="vertical"
         renderItem={(item, index) => {
            const avatarData = generateAvatarData(item.device.machineModel.name)
            return (
               <List.Item
                  className={cn("w-full px-layout", index === 0 && "mt-0", index % 2 === 0 && "bg-neutral-100")}
                  onClick={() => router.push(hd_uris.stack.history_id(item.id))}
               >
                  <List.Item.Meta
                     className="head_department_history_list mb-4"
                     avatar={<Avatar className={cn(avatarData.color)}>{avatarData.content}</Avatar>}
                     title={<div className="truncate text-base">{item.device.machineModel.name}</div>}
                     description={<div className="truncate text-sm">{item.requester_note}</div>}
                  ></List.Item.Meta>
                  <div className="flex items-end">
                     <DataGrid
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
                              className: "text-blue-500",
                           },
                           {
                              icon: <User size={16} weight="duotone" />,
                              value: item.checker?.username,
                              hidden: item.status === FixRequestStatus.PENDING,
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

function getCreatedAt(request: RequestDto) {
   const dateRaw = request.createdAt
   const date = dayjs(dateRaw).locale("vi")
   const now = dayjs()

   if (now.isSame(date, "day")) {
      return date.fromNow()
   } else {
      return date.format("DD/MM/YYYY")
   }
}

export default HistoryList
