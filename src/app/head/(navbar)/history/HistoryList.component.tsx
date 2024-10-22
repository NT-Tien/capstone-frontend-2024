import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { Button, Card, List, Result, Skeleton, Tag } from "antd"
import { TruckFilled } from "@ant-design/icons"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import useRequest_AllQuery from "@/features/head-department/queries/Request_All.query"
import RequestCard from "@/features/head-maintenance/components/RequestCard"
import hd_uris from "@/features/head-department/uri"

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
         renderItem={(item, index) => (
            <List.Item className={cn("w-full", index === 0 && "mt-0")}>
               <RequestCard.Large
                  className={cn("w-full px-layout", index % 2 === 0 ? "bg-white" : "bg-gray-100")}
                  description={item.requester_note}
                  footerLeft={
                     <div>
                        {item.is_warranty && (
                           <Tag color="orange-inverse">
                              <TruckFilled /> Bảo hành
                           </Tag>
                        )}
                        {item.status === FixRequestStatus.REJECTED ? (
                           <div className="w-32 truncate">Lý do: {item.checker_note}</div>
                        ) : undefined}
                     </div>
                  }
                  footerRight={<div></div>}
                  tag={<span className="text-xs text-neutral-500">{getCreatedAt(item)}</span>}
                  subtitle={`${item.requester.username} | ${item?.device?.area?.name}`}
                  title={item.device.machineModel.name}
                  onClick={() => {
                     router.push(hd_uris.stack.history_id(item.id))
                  }}
                  footerClassName="mt-1"
               />
            </List.Item>
         )}
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
