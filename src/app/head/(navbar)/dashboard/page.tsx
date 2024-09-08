"use client"

import head_qk from "@/app/head/_api/qk"
import Head_Request_All from "@/app/head/_api/request/all.api"
import HomeHeader from "@/common/components/HomeHeader"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { CalendarCheck, CalendarSlash, Gear, HourglassSimpleMedium, NotePencil, SealCheck, Timer } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { Card } from "antd"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useState } from "react"
import CountUp from "react-countup"
import Image from "next/image"

function useRequest(current: number, pageSize: number, currentStatus: FixRequestStatus) {
   return useQuery({
      queryKey: head_qk.requests.all(),
      queryFn: () => Head_Request_All(),
   })
}

function Page() {
   const router = useRouter()
   const currentDefault = 1,
      pageSizeDefault = 10

   const searchParams = useSearchParams()
   const [current, setCurrent] = useState(Number(searchParams.get("current")) || currentDefault)
   const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || pageSizeDefault)

   const requestPending = useRequest(current, pageSize, FixRequestStatus.PENDING)
   const requestApproved = useRequest(current, pageSize, FixRequestStatus.APPROVED)
   const requestInProgress = useRequest(current, pageSize, FixRequestStatus.IN_PROGRESS)
   const requestClosed = useRequest(current, pageSize, FixRequestStatus.CLOSED)
   const requestRejected = useRequest(current, pageSize, FixRequestStatus.REJECTED)

   const totalRequests = [
      requestPending.data?.length ?? 0,
      requestApproved.data?.length ?? 0,
      requestInProgress.data?.length ?? 0,
      requestClosed.data?.length ?? 0,
      requestRejected.data?.length ?? 0,
   ].reduce((acc, curr) => acc + curr, 0)

   const pendingRequest = requestPending.data?.length ?? 0
   const approvedRequest = requestApproved.data?.length ?? 0
   const inProgressRequest = requestInProgress.data?.length ?? 0
   const closedRequest = requestClosed.data?.length ?? 0
   const rejectedRequest = requestRejected.data?.length ?? 0

   return (
      <div>
         <div>
         <Image
            className="std-layout-outer absolute h-32 w-full object-cover opacity-40"
            src="/images/background5.jpg"
            alt="image"
            width={784}
            height={100}
            style={{
               WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               objectFit: "fill",
            }}
         />
            <div className="std-layout">
               <HomeHeader className="std-layout-inner pb-8 pt-4" />
            </div>
         </div>
         <div className="std-layout">
            <section className="mt-5 flex-none space-y-4">
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-orange-200 border-2 border-neutral-300 p-0 text-center shadow-md"
                  loading={
                     requestPending.isLoading ||
                     requestInProgress.isLoading ||
                     requestApproved.isLoading ||
                     requestRejected.isLoading ||
                     requestClosed.isLoading
                  }
                  onClick={() => router.push("history")}
                  classNames={{
                     body: "w-full",
                  }}
               >
                  <div className="flex w-full items-center justify-between">
                     <div className="flex flex-col items-start">
                        <div className="flex items-center">
                           <div className="text-3xl font-bold">
                              <CountUp end={totalRequests} separator={","} />
                           </div>
                        </div>
                        <div className="text-xl">Tổng cộng</div>
                     </div>
                     <div className="flex items-center">
                        <Gear size={45} weight="duotone"/>
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-neutral-200 border-2 border-neutral-300 p-0 text-center shadow-md"
                  loading={requestPending.isLoading}
                  onClick={() => router.push("history")}
                  classNames={{
                     body: "w-full",
                  }}
               >
                  <div className="flex w-full items-center justify-between">
                     <div className="flex flex-col items-start">
                        <div className="flex items-center">
                           <div className="text-3xl font-bold">
                              <CountUp end={pendingRequest} separator={","} />
                           </div>
                        </div>
                        <div className="text-xl">Chưa xử lý</div>
                     </div>
                     <div className="flex items-center">
                        <NotePencil size={45} weight="duotone" />
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-green-200 border-2 border-neutral-300 p-0 text-center shadow-md"
                  loading={requestApproved.isLoading}
                  onClick={() => router.push("history")}
                  classNames={{
                     body: "w-full",
                  }}
               >
                  <div className="flex w-full items-center justify-between">
                     <div className="flex flex-col items-start">
                        <div className="flex items-center">
                           <div className="text-3xl font-bold">
                              <CountUp end={approvedRequest} separator={","} />
                           </div>
                        </div>
                        <div className="text-xl">Xác nhận</div>
                     </div>
                     <div className="flex items-center">
                        <CalendarCheck size={45} />
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-blue-200 border-2 border-neutral-300 p-0 text-center shadow-md"
                  loading={requestInProgress.isLoading}
                  onClick={() => router.push("history")}
                  classNames={{
                     body: "w-full",
                  }}
               >
                  <div className="flex w-full items-center justify-between">
                     <div className="flex flex-col items-start">
                        <div className="flex items-center">
                           <div className="text-3xl font-bold">
                              <CountUp end={inProgressRequest} separator={","} />
                           </div>
                        </div>
                        <div className="text-xl">Đang thực hiện</div>
                     </div>
                     <div className="flex items-center">
                        <HourglassSimpleMedium size={45} weight="duotone" />
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-purple-200 border-2 border-neutral-300 p-0 text-center shadow-md"
                  loading={requestClosed.isLoading}
                  onClick={() => router.push("history")}
                  classNames={{
                     body: "w-full",
                  }}
               >
                  <div className="flex w-full items-center justify-between">
                     <div className="flex flex-col items-start">
                        <div className="flex items-center">
                           <div className="text-3xl font-bold">
                              <CountUp end={closedRequest} separator={","} />
                           </div>
                        </div>
                        <div className="text-xl">Đóng</div>
                     </div>
                     <div className="flex items-center">
                        <SealCheck size={45} />
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-red-200 border-2 border-neutral-300 p-0 text-center shadow-md"
                  loading={requestRejected.isLoading}
                  onClick={() => router.push("history")}
                  classNames={{
                     body: "w-full",
                  }}
               >
                  <div className="flex w-full items-center justify-between">
                     <div className="flex flex-col items-start">
                        <div className="flex items-center">
                           <div className="text-3xl font-bold">
                              <CountUp end={rejectedRequest} separator={","} />
                           </div>
                        </div>
                        <div className="text-xl">Không tiếp nhận</div>
                     </div>
                     <div className="flex items-center">
                        <CalendarSlash size={45} weight="duotone" />
                     </div>
                  </div>
               </Card>
            </section>
         </div>
      </div>
   )
}

export default Page
