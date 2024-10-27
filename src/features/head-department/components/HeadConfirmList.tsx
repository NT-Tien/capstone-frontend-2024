import { useState } from "react"
import { Button, Card, List, Typography } from "antd"
import { CheckCircleOutlined, RightOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import DataGrid from "@/components/DataGrid"
import { CalendarBlank, MapPinArea } from "@phosphor-icons/react"
import hd_uris from "../uri"
import { useRouter } from "next/navigation"

type Props = {
   requests: RequestDto[] | undefined
}

function HeadConfirmList({ requests }: Props) {
   const router = useRouter()

   return (
      <Card
         size="small"
         bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
         title={
            <div className="text-center">
               <CheckCircleOutlined /> <Typography.Text>Yêu cầu chờ đánh giá</Typography.Text>
            </div>
         }
      >
         <List
            dataSource={requests?.slice(0, 3)}
            split
            itemLayout="vertical"
            renderItem={(item) => (
               <List.Item onClick={() => router.push(hd_uris.stack.history_id(item.id))}>
                  <List.Item.Meta
                     className="head_department_history_list mb-4"
                     title={<div className="truncate text-sm">{item.device.machineModel.name}</div>}
                     description={<div className="truncate text-xs">{item.requester_note}</div>}
                  />
                  <div className="flex items-end">
                     <DataGrid
                        cols={2}
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
                        ]}
                     />
                     <RightOutlined className="text-xs text-neutral-500" />
                  </div>
               </List.Item>
            )}
         />
         {requests && requests.length > 3 && (
            <div className="mt-2 text-center mb-2">
               <Button onClick={() => router.push("history?status=head_confirm")}>Tải thêm</Button>
            </div>
         )}
      </Card>
   )
}

export default HeadConfirmList
