import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { Button, Card, List, Result, Skeleton, Tag } from "antd"
import { TruckFilled } from "@ant-design/icons"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import useRequest_AllQuery from "@/features/head-department/queries/Request_All.query"
import RequestCard from "@/features/head-maintenance/components/RequestCard"

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
                  className={cn(
                     "w-full px-layout",
                     index % 2 === 0 ? "bg-white" : "bg-gray-100",
                     item.is_seen === false &&
                        "border-[1px] border-green-100 bg-green-100 p-2 transition-all hover:bg-green-200",
                  )}
                  headerClassName={cn(item.is_seen === false && "rounded-lg p-1")}
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
                  footerRight={<span className="text-xs text-neutral-500">{getCreatedAt(item)}</span>}
                  subtitle={`${item.requester.username} | ${item?.device?.area?.name}`}
                  title={item.device.machineModel.name}
                  onClick={() => {
                     const statuses = new Set([FixRequestStatus.PENDING, FixRequestStatus.REJECTED])
                     if (statuses.has(item.status)) {
                        router.push(`/head/history/${item.id}`)
                     } else {
                        router.push(`/head/history/${item.id}/approved`)
                     }
                  }}
                  tag={
                     item.is_seen === false && (
                        <Tag color="green" className="m-0">
                           Mới
                        </Tag>
                     )
                  }
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
