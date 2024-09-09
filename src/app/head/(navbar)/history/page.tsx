"use client"

import head_qk from "@/app/head/_api/qk"
import Head_Request_All from "@/app/head/_api/request/all.api"
import RootHeader from "@/common/components/RootHeader"
import ScrollableTabs from "@/common/components/ScrollableTabs"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { cn } from "@/common/util/cn.util"
import extended_dayjs from "@/config/dayjs.config"
import { ClockCircleOutlined } from "@ant-design/icons"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { Button, Card, Empty, Result, Skeleton } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
   FixRequest_StatusData,
   FixRequest_StatusMapper,
   FixRequestStatuses,
} from "@/common/dto/status/FixRequest.status"
import RequestCard from "@/app/head/_components/RequestCard"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"

function Page({ searchParams }: { searchParams: { status: FixRequestStatuses } }) {
   const router = useRouter()
   const api_requests = useQuery({
      queryKey: head_qk.requests.all(),
      queryFn: () => Head_Request_All(),
   })
   const [tab, setTab] = useState<FixRequestStatuses>(searchParams.status ?? FixRequest_StatusData("pending").name)

   const datasets = useMemo(() => {
      const response: Partial<{
         [key in FixRequestStatuses]: FixRequestDto[]
      }> = {
         pending: [],
         head_cancel: [],
         approved: [],
         closed: [],
         in_progress: [],
         head_confirm: [],
         rejected: [],
      }

      api_requests.data?.forEach((req) => {
         const status = FixRequest_StatusMapper(req)

         if (status) {
            response[status.name]?.push(req)
         }
      })

      return response
   }, [api_requests])

   function handleTabChange(tab: FixRequestStatuses) {
      router.push(`/head/history?status=${tab}`)
      setTab(tab)
   }

   return (
      <div className="std-layout">
         <RootHeader title={"Lịch sử"} className="std-layout-outer p-4" icon={<ClockCircleOutlined />} />
         <ScrollableTabs
            className="std-layout-outer sticky left-0 top-0 z-50"
            classNames={{
               content: "mt-layout",
            }}
            tab={tab}
            onTabChange={handleTabChange}
            items={[
               {
                  key: FixRequest_StatusData("pending").name,
                  title: FixRequest_StatusData("pending").text,
                  icon: FixRequest_StatusData("pending", {
                     phosphor: { size: 16 },
                  }).icon,
                  badge: datasets.pending?.length,
               },
               // {
               //    key: FixRequest_StatusData("checked").name,
               //    title: FixRequest_StatusData("checked").text,
               //    icon: FixRequest_StatusData("checked").icon,
               //    badge: datasets.checked.length,
               // },
               {
                  key: FixRequest_StatusData("approved").name,
                  title: FixRequest_StatusData("approved").text,
                  icon: FixRequest_StatusData("approved", {
                     phosphor: { size: 16 },
                  }).icon,
                  badge: datasets.approved?.length,
               },
               {
                  key: FixRequest_StatusData("in_progress").name,
                  title: FixRequest_StatusData("in_progress").text,
                  icon: FixRequest_StatusData("in_progress", {
                     phosphor: { size: 16 },
                  }).icon,
                  badge: datasets.in_progress?.length,
               },
               {
                  key: FixRequest_StatusData("head_confirm").name,
                  title: FixRequest_StatusData("head_confirm").text,
                  icon: FixRequest_StatusData("head_confirm", {
                     phosphor: { size: 16 },
                  }).icon,
                  badge: datasets.head_confirm?.length,
               },
               {
                  key: FixRequest_StatusData("closed").name,
                  title: FixRequest_StatusData("closed").text,
                  icon: FixRequest_StatusData("closed", {
                     phosphor: { size: 16 },
                  }).icon,
                  badge: datasets.closed?.length,
               },
               {
                  key: FixRequest_StatusData("rejected").name,
                  title: FixRequest_StatusData("rejected").text,
                  icon: FixRequest_StatusData("rejected", {
                     phosphor: { size: 16 },
                  }).icon,
                  badge: datasets.rejected?.length,
               },
               {
                  key: FixRequest_StatusData("head_cancel").name,
                  title: FixRequest_StatusData("head_cancel").text,
                  icon: FixRequest_StatusData("head_cancel", {
                     phosphor: { size: 16 },
                  }).icon,
                  badge: datasets.head_cancel?.length,
               },
            ]}
         />
         <IssueList data={datasets[tab] ?? []} statusName={tab} api_requests={api_requests} className="mb-layout" />
      </div>
   )
}

type IssueListProps = {
   data: FixRequestDto[]
   api_requests: UseQueryResult<FixRequestDto[], Error>
   statusName: FixRequestStatuses
   className?: string
}

function IssueList({ data, api_requests, statusName, className }: IssueListProps) {
   const router = useRouter()

   return (
      <>
         {api_requests.isSuccess ? (
            <div className={cn("grid grid-cols-1 gap-3", className)}>
               {data.length === 0 ? (
                  <Card className="h-full">
                     <Empty
                        description={`Bạn không có báo cáo với trạng thái \"${FixRequest_StatusData(statusName.toLowerCase() as any).text}\"`}
                     ></Empty>
                  </Card>
               ) : (
                  data.map((req, index) => (
                     <RequestCard
                        className="cursor-default"
                        dto={req}
                        index={index}
                        key={req.id}
                        id={req.id}
                        positionX={req.device.positionX}
                        positionY={req.device.positionY}
                        area={req.device.area.name}
                        machineModelName={req.device.machineModel.name}
                        createdDate={extended_dayjs(req.createdAt).add(7, "hours").locale("vi").fromNow()}
                        onClick={(id: string) => router.push(`/head/history/${id}`)}
                     />
                  ))
               )}
            </div>
         ) : (
            <>
               {api_requests.isPending && (
                  <div className="grid grid-cols-1 gap-2">
                     <Skeleton paragraph active />
                     <Skeleton paragraph active />
                     <Skeleton paragraph active />
                     <Skeleton paragraph active />
                     <Skeleton paragraph active />
                  </div>
               )}
               {api_requests.isError && (
                  <Card size="small">
                     <Result
                        status="error"
                        title="Đã xảy ra lỗi"
                        subTitle="Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại."
                        extra={
                           <Button type="primary" onClick={() => api_requests.refetch()}>
                              Thử lại
                           </Button>
                        }
                     />
                  </Card>
               )}
            </>
         )}
      </>
   )
}

export default Page
