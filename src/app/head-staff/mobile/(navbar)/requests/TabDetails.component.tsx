import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_All30Days from "@/app/head-staff/_api/request/all30Days.api"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, List, Result, Skeleton, Tag } from "antd"
import { useRouter } from "next/navigation"
import RequestCard from "./RequestCard"
import dayjs from "dayjs"
import { cn } from "@/common/util/cn.util"
import { useMemo } from "react"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"

type Props = {
   status: FixRequestStatus
}

function TabDetails(props: Props) {
   const router = useRouter()
   const api_requests = useQuery({
      queryKey: headstaff_qk.request.all({
         page: 1,
         limit: 50,
         status: props.status,
      }),
      queryFn: () =>
         HeadStaff_Request_All30Days({
            page: 1,
            limit: 50,
            status: props.status,
         }),
   })

   if (!api_requests.isSuccess) {
      if (api_requests.isPending) {
         return <Skeleton active />
      }

      if (api_requests.isError) {
         return (
            <Card>
               <Result
                  title="Có lỗi xảy ra"
                  subTitle="Vui lòng thử lại sau"
                  extra={<Button onClick={() => api_requests.refetch()}>Thử lại</Button>}
               />
            </Card>
         )
      }
   }

   return (
      <List
         rowKey="id"
         split
         dataSource={api_requests.data?.list}
         renderItem={(item, index) => (
            <List.Item className={cn("w-full", index === 0 && "mt-0")}>
               <RequestCard
                  className={cn("w-full", item.is_seen === false && "rounded-lg bg-green-100 p-2")}
                  headerClassName={cn(item.is_seen === false && "bg-green-100 rounded-lg p-1")}
                  description={item.requester_note}
                  footerLeft={
                     item.status === FixRequestStatus.REJECTED ? (
                        <div className="w-32 truncate">Lý do: {item.checker_note}</div>
                     ) : undefined
                  }
                  footerRight={getCreatedAt(item)}
                  subtitle={`${item.requester.username} | ${item.device.area.name}`}
                  title={item.device.machineModel.name}
                  onClick={() => {
                     const statuses = new Set([FixRequestStatus.PENDING, FixRequestStatus.REJECTED])
                     if (statuses.has(item.status)) {
                        router.push(`/head-staff/mobile/requests/${item.id}`)
                     } else {
                        router.push(`/head-staff/mobile/requests/${item.id}/approved`)
                     }
                  }}
                  tag={
                     item.is_seen === false && (
                        <Tag color="green" className="m-0">
                           Mới
                        </Tag>
                     )
                  }
               />
            </List.Item>
         )}
      />
   )
}

function getCreatedAt(request: FixRequestDto) {
   const dateRaw = request.createdAt
   const date = dayjs(dateRaw).add(7, "hours").locale("vi")
   const now = dayjs()

   if (now.isSame(date, "day")) {
      return date.fromNow()
   } else {
      return date.format("DD/MM/YYYY")
   }
}

export default TabDetails
