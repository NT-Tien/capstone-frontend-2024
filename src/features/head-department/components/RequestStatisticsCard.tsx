import { Button, Space } from "antd"
import { cn } from "@/lib/utils/cn.util"
import head_department_queries from "@/features/head-department/queries"
import { useMemo } from "react"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import dayjs from "dayjs"

type Props = {
   className?: string
}

function RequestStatisticsCard(props: Props) {
   const api_requests = head_department_queries.request.all({})
   const counts = useMemo(() => {
      const counts: {
         [key in FixRequestStatus]: number
      } = {
         [FixRequestStatus.PENDING]: 0,
         [FixRequestStatus.APPROVED]: 0,
         [FixRequestStatus.IN_PROGRESS]: 0,
         [FixRequestStatus.CLOSED]: 0,
         [FixRequestStatus.REJECTED]: 0,
         [FixRequestStatus.HEAD_CANCEL]: 0,
         [FixRequestStatus.HEAD_CONFIRM]: 0,
      }
      api_requests.data?.forEach((request) => {
         counts[request.status] += 1
      })
      return counts
   }, [api_requests.data])

   return (
      <article className={cn("w-full text-black", props.className)}>
         <Space.Compact className="w-full">
            <Button block className="grid h-max place-items-center gap-0 rounded-none rounded-tl-lg py-4 text-base">
               <div>{counts.PENDING}</div>
               <div>Chờ xử lý</div>
            </Button>
            <Button block className="grid h-max place-items-center gap-0 rounded-none py-4 text-base">
               <div>{counts.IN_PROGRESS}</div>
               <div>Thực hiện</div>
            </Button>
            <Button block className="grid h-max place-items-center gap-0 rounded-none rounded-tr-lg py-4 text-base">
               <div>{counts.HEAD_CONFIRM}</div>
               <div>Đánh giá</div>
            </Button>
         </Space.Compact>
         <Space.Compact direction="vertical" className="w-full">
            <Button block className="flex justify-between rounded-none border-t-0 py-5 text-sm">
               <div>Đã xác nhận</div>
               <div>{counts.APPROVED}</div>
            </Button>
            <Button block className="flex justify-between rounded-none py-5 text-sm">
               <div>Đã hủy</div>
               <div>{counts.REJECTED + counts.HEAD_CANCEL}</div>
            </Button>
            <Button block className="flex justify-between rounded-none rounded-b-lg py-5 text-sm">
               <div>Đã đóng</div>
               <div>{counts.CLOSED}</div>
            </Button>
         </Space.Compact>
         {/*<section className="rounded-b-lg border-[1px] border-t-0 border-neutral-200 bg-white p-layout"></section>*/}
      </article>
   )
}

export default RequestStatisticsCard
