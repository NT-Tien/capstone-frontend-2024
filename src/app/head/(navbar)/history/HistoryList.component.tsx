import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { Avatar, Card, List, Result, Skeleton } from "antd"
import { ExclamationCircleFilled, RightOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import hd_uris from "@/features/head-department/uri"
import generateAvatarData from "@/lib/utils/generateAvatarData.util"
import { CalendarBlank, Laptop, MapPinArea, Phone, Swap, Truck, User, Wrench } from "@phosphor-icons/react"
import DataGrid from "@/components/DataGrid"
import ClickableArea from "@/components/ClickableArea"

type Props = {
   requests: RequestDto[] | undefined
}

function HistoryList({ requests }: Props) {
   const router = useRouter()

   if (!requests) {
      return <Skeleton className="mt-layout" active />
   }

   if (requests.length === 0) {
      return (
         <Card className={"mt-layout"}>
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
            const avatarData = generateAvatarData(item.old_device.machineModel.name)
            return (
               <ClickableArea
                  onClick={() => router.push(hd_uris.stack.history_id(item.id))}
                  className="w-full rounded-none"
               >
                  <List.Item
                     className={cn("w-full px-layout", index === 0 && "mt-0", index % 2 === 0 && "bg-neutral-100")}
                  >
                     <List.Item.Meta
                        className="head_department_history_list mb-4"
                        avatar={<Avatar className={cn(avatarData.color)}>{avatarData.content}</Avatar>}
                        title={<div className="truncate text-base"># {item.code}</div>}
                        description={<div className="truncate text-sm">{item.requester_note}</div>}
                     ></List.Item.Meta>
                     <div className="flex items-end">
                        <DataGrid
                           className="flex-grow text-xs text-neutral-500"
                           items={[
                              {
                                 value: <div className='truncate w-[40vw]'>{item.old_device.machineModel.name}</div>,
                                 icon: <Laptop size={16} weight="duotone" />,
                              },
                              {
                                 value: (
                                    <>
                                       {item.old_device.area?.name}{" "}
                                       {item.old_device.positionX && item.old_device.positionY
                                          ? `(${item.old_device.positionX}, ${item.old_device.positionY})`
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
                                 icon: <ExclamationCircleFilled />,
                                 value: "Chờ xác nhận",
                                 hidden: item.status !== FixRequestStatus.HM_VERIFY,
                                 className: "text-red-500",
                              },
                           ]}
                           cols={2}
                        />
                        <RightOutlined className="text-xs text-neutral-500" />
                     </div>
                  </List.Item>
               </ClickableArea>
            )
         }}
      />
   )
}

export default HistoryList
