// "use client"

// import ScrollableTabs from "@/components/ScrollableTabs"
// import { RequestDto } from "@/lib/domain/Request/Request.dto"
// import { cn } from "@/lib/utils/cn.util"
// import extended_dayjs from "@/config/dayjs.config"
// import { UseQueryResult } from "@tanstack/react-query"
// import { Button, Card, Empty, Result, Skeleton, Tabs } from "antd"
// import { useRouter } from "next/navigation"
// import { useMemo, useState } from "react"
// import {
//    FixRequest_StatusData,
//    FixRequest_StatusMapper,
//    FixRequestStatuses,
// } from "@/lib/domain/Request/RequestStatus.mapper"
// import RequestCard from "@/features/head-department/components/RequestCard"
// import useRequest_AllQuery from "@/features/head-department/queries/Request_All.query"
// import { AddressBook } from "@phosphor-icons/react"
// import PageHeader from "@/components/layout/PageHeader"
// import Image from "next/image"

// function Page({ searchParams }: { searchParams: { status: FixRequestStatuses } }) {
//    const router = useRouter()

//    const api_requests = useRequest_AllQuery()

//    const [tab, setTab] = useState<FixRequestStatuses>(searchParams.status ?? FixRequest_StatusData("pending").name)

//    const datasets = useMemo(() => {
//       const response: Partial<{
//          [key in FixRequestStatuses]: RequestDto[]
//       }> = {
//          pending: [],
//          head_cancel: [],
//          approved: [],
//          closed: [],
//          in_progress: [],
//          head_confirm: [],
//          rejected: [],
//       }

//       api_requests.data?.forEach((req) => {
//          const status = FixRequest_StatusMapper(req)

//          if (status) {
//             response[status.name]?.push(req)
//          }
//       })

//       return response
//    }, [api_requests])

//    function handleTabChange(tab: FixRequestStatuses) {
//       router.push(`/head/history?status=${tab}`)
//       setTab(tab)
//    }

//    return (
//       <div className="std-layout relative h-full min-h-screen bg-white">
//          <PageHeader title="Yêu cầu" icon={AddressBook} className="std-layout-outer relative z-30" />
//          <Image
//             className="std-layout-outer absolute h-32 w-full object-cover opacity-40"
//             src="/images/requests.jpg"
//             alt="image"
//             width={784}
//             height={100}
//             style={{
//                WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
//                maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
//                objectFit: "fill",
//             }}
//          />
//          <Tabs
//             className="std-layout-outer sticky left-0 top-0 z-50"
//             // classNames={{
//             //    content: "mt-layout",
//             // }}
//             activeKey={tab}
//             onChange={(e) => handleTabChange(e as FixRequestStatuses)}
//             items={(
//                ["pending", "approved", "in_progress", "head_confirm", "closed", "rejected"] as FixRequestStatuses[]
//             ).map((status, index, array) => ({
//                key: FixRequest_StatusData(status).statusEnum,
//                label: (
//                   <div
//                      className={cn(
//                         "flex w-min items-center justify-center gap-3 break-words font-base",
//                         index === 0 && "ml-layout",
//                         index === array.length - 1 && "mr-layout",
//                      )}
//                   >
//                      {/* <div className="text-lg">{FixRequest_StatusData(status).icon}</div> */}
//                      {FixRequest_StatusData(status).text}
//                   </div>
//                ),
//             }))}
//          />
//          <IssueList data={datasets[tab] ?? []} statusName={tab} api_requests={api_requests} className="mb-layout" />
//       </div>
//    )
// }

// type IssueListProps = {
//    data: RequestDto[]
//    api_requests: UseQueryResult<RequestDto[], Error>
//    statusName: FixRequestStatuses
//    className?: string
// }

// function IssueList({ data, api_requests, statusName, className }: IssueListProps) {
//    const router = useRouter()

//    return (
//       <>
//          {api_requests.isSuccess ? (
//             <div className={cn("grid grid-cols-1 gap-3", className)}>
//                {data.length === 0 ? (
//                   <Card className="h-full">
//                      <Empty
//                         description={`Bạn không có báo cáo với trạng thái \"${FixRequest_StatusData(statusName.toLowerCase() as any).text}\"`}
//                      ></Empty>
//                   </Card>
//                ) : (
//                   data.map((req, index) => (
//                      <RequestCard
//                         className="cursor-default"
//                         dto={req}
//                         index={index}
//                         key={req.id}
//                         id={req.id}
//                         positionX={req.device.positionX}
//                         positionY={req.device.positionY}
//                         area={req.device.area.name}
//                         machineModelName={req.device.machineModel.name}
//                         createdDate={extended_dayjs(req.createdAt).add(7, "hours").locale("vi").fromNow()}
//                         onClick={(id: string) => router.push(`/head/history/${id}`)}
//                      />
//                   ))
//                )}
//             </div>
//          ) : (
//             <>
//                {api_requests.isPending && (
//                   <div className="grid grid-cols-1 gap-2">
//                      <Skeleton paragraph active />
//                      <Skeleton paragraph active />
//                      <Skeleton paragraph active />
//                      <Skeleton paragraph active />
//                      <Skeleton paragraph active />
//                   </div>
//                )}
//                {api_requests.isError && (
//                   <Card size="small">
//                      <Result
//                         status="error"
//                         title="Đã xảy ra lỗi"
//                         subTitle="Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại."
//                         extra={
//                            <Button type="primary" onClick={() => api_requests.refetch()}>
//                               Thử lại
//                            </Button>
//                         }
//                      />
//                   </Card>
//                )}
//             </>
//          )}
//       </>
//    )
// }

// export default Page
"use client"

import PageHeader from "@/components/layout/PageHeader"
import { FixRequest_StatusData, FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { AddressBook } from "@phosphor-icons/react"
import { Card, Spin, Tabs } from "antd"
import Image from "next/image"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQueries } from "@tanstack/react-query"
import { cn } from "@/lib/utils/cn.util"
import HistoryList from "./HistoryList.component"
import useRequest_AllQuery from "@/features/head-department/queries/Request_All.query"
import Head_Request_All from "@/features/head-department/api/request/all.api"

function Page() {
   return (
      <Suspense fallback={<Spin fullscreen />}>
         <Component />
      </Suspense>
   )
}

function Component() {
   const searchParams = useSearchParams()
   const router = useRouter()
   const [tab, setTab] = useState<FixRequestStatuses | undefined>(undefined)

   const { data: requests, isLoading } = useRequest_AllQuery();

  // Filter data based on selected status
  const filteredRequests = tab
    ? requests?.filter((req) => req.status === tab.toUpperCase())
    : requests;

  function handleChangeTab(tabKey: string) {
    setTab(tabKey as FixRequestStatuses);

    const tabURL = new URLSearchParams();
    tabURL.set("status", tabKey);
    router.push("/head/history?" + tabURL.toString());
  }

  useEffect(() => {
    const status = searchParams.get("status");

    if (status) {
      const allStatuses = Object.values(FixRequestStatus);
      if (allStatuses.includes(status as FixRequestStatus)) {
        setTab(status as FixRequestStatuses);
      }
      return;
    }

    // Default to the first tab
    setTab("pending");
  }, [searchParams]);

  // Count requests for each status
  const statusCounts = Object.values(FixRequestStatus).reduce((acc, status) => {
    acc[status] = requests?.filter((req) => req.status === status).length || 0;
    return acc;
  }, {} as Record<FixRequestStatus, number>);
   // const counts = useQueries({
   //    queries: Object.values(FixRequestStatus).map(() => ({
   //       queryKey: useRequest_AllQuery.qk(),
   //       queryFn: () => Head_Request_All(),
   //    })),
   //    combine: (results) => {
   //       return results.reduce(
   //          (acc, { data }, index) => {
   //             acc[Object.values(FixRequestStatus)[index]] = data?.length ?? 0
   //             return acc
   //          },
   //          {} as Record<FixRequestStatus, number>,
   //       )
   //    },
   // })

   // function handleChangeTab(tab: FixRequestStatuses) {
   //    setTab(tab)

   //    const tabURL = new URLSearchParams()
   //    tabURL.set("status", tab)
   //    router.push("/head/history?" + tabURL.toString())
   // }

   // useEffect(() => {
   //    const status = searchParams.get("status")

   //    if (status) {
   //       const allStatuses = Object.values(FixRequestStatus)
   //       if (allStatuses.includes(status as FixRequestStatus)) {
   //          setTab(status as FixRequestStatuses)
   //       }
   //       return
   //    }

   //    setTab("pending" || "head_cancel" || "approved" || "rejected" || "in_progress" || "head_confirm" || "closed")
   // }, [searchParams])
   // console.log(counts)

   return (
      <div className="std-layout relative h-full min-h-screen bg-white">
         <PageHeader title="Yêu cầu" icon={AddressBook} className="std-layout-outer relative z-30" />
         <Image
            className="std-layout-outer absolute h-32 w-full object-cover opacity-40"
            src="/images/requests.jpg"
            alt="image"
            width={784}
            height={100}
            style={{
               WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               objectFit: "fill",
            }}
         />
         <Tabs
            className="std-layout-outer relative z-30"
            activeKey={tab}
            onChange={(e) => handleChangeTab(e as FixRequestStatuses)}
            items={(
               ["pending", "approved", "in_progress", "head_confirm", "closed", "rejected"] as FixRequestStatuses[]
            ).map((status, index, array) => ({
               key: FixRequest_StatusData(status).statusEnum,
               label: (
                  <div
                     className={cn(
                        "flex w-min items-center justify-center gap-3 break-words font-base",
                        index === 0 && "ml-layout",
                        index === array.length - 1 && "mr-layout",
                     )}
                  >
                     {/* <div className="text-lg">{FixRequest_StatusData(status).icon}</div> */}
                     {FixRequest_StatusData(status).text} ({statusCounts[status.toUpperCase() as FixRequestStatus] || 0})
                     </div>
               ),
            }))}
         />
         {tab ? (
            <HistoryList status={tab} requests={filteredRequests} />
         ) : (
            <Card>
               <Spin fullscreen />
            </Card>
         )}
      </div>
   )
}

export default Page
