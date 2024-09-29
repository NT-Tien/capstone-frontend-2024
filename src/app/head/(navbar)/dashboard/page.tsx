"use client"

import HomeHeader from "@/components/layout/HomeHeader"
import { FixRequest_StatusData } from "@/lib/domain/Request/RequestStatus.mapper"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { Gear } from "@phosphor-icons/react"
import { Card, Select } from "antd"
import dayjs from "dayjs"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ReactNode, useMemo, useState } from "react"
import CountUp from "react-countup"
import useRequest_AllQuery from "@/features/head-department/queries/Request_All.query"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

type FilterOptions = "today" | "this week" | "this month" | "this year"

type Props = {
   id: string
   machineModelName: string
   createdDate: string
   status?: FixRequestStatus
   positionX: number
   positionY: number
   note?: string
   area: string
   onClick?: (id: string) => void
   index: number
   className?: string
   new?: boolean
   requester?: string
   dto?: RequestDto
   hasCheck?: boolean
}

function Page({ items = [] }: { items?: Props[] }) {
   const router = useRouter()

   const [filter, setFilter] = useState<FilterOptions>("today")

   const api_requests = useRequest_AllQuery()

   const counts = useMemo(() => {
      const counts = {
         [FixRequestStatus.PENDING]: 0,
         [FixRequestStatus.APPROVED]: 0,
         [FixRequestStatus.IN_PROGRESS]: 0,
         [FixRequestStatus.CLOSED]: 0,
         [FixRequestStatus.REJECTED]: 0,
         [FixRequestStatus.HEAD_CANCEL]: 0,
         [FixRequestStatus.HEAD_CONFIRM]: 0,
      }
      api_requests.data?.forEach((request) => {
         switch (filter) {
            case "today": {
               if (dayjs(request.createdAt).add(7, "hours").isSame(dayjs(), "day")) {
                  counts[request.status]++
               }
               return
            }
            case "this week": {
               if (dayjs(request.createdAt).add(7, "hours").isAfter(dayjs().subtract(7, "days"))) {
                  counts[request.status]++
               }
               return
            }
            case "this month": {
               if (dayjs(request.createdAt).add(7, "hours").isAfter(dayjs().subtract(30, "days"))) {
                  counts[request.status]++
               }
               return
            }
            case "this year": {
               if (dayjs(request.createdAt).add(7, "hours").isAfter(dayjs().subtract(365, "days"))) {
                  counts[request.status]++
               }
               return
            }
            default: {
               counts[request.status]++
               return
            }
         }
      })
      return counts
   }, [api_requests.data, filter])

   const sortedItems = Array.isArray(items)
      ? items.sort((a, b) => (dayjs(b.createdDate).isAfter(dayjs(a.createdDate)) ? 1 : -1))
      : []
   return (
      <div className="pb-2">
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
            <section className="mt-5">
               <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">Thống kê</div>
                  <Select
                  className="w-44 text-center"
                     placeholder="Lọc dữ liệu"
                     value={filter}
                     onChange={(value) => setFilter(value)}
                     size="large"
                     options={[
                        { value: "today" as FilterOptions, label: "Hôm nay" },
                        { value: "this week" as FilterOptions, label: "7 ngày trước" },
                        { value: "this month" as FilterOptions, label: "30 ngày trước" },
                        { value: "this year" as FilterOptions, label: "365 ngày trước" },
                     ]}
                  />
               </div>
            </section>
            <section className="mt-3 space-y-2">
               {sortedItems.map((item) => (
                  <Card key={item.id} onClick={() => item.onClick?.(item.id)} className={item.className}>
                     <div>
                        <h3>{item.machineModelName}</h3>
                        <p>
                           Position: X {item.positionX}, Y {item.positionY}
                        </p>
                        <p>Area: {item.area}</p>
                        {/* <p>Created Date: {dayjs(item.createdDate).format("YYYY-MM-DD HH:mm")}</p> */}
                     </div>
                  </Card>
               ))}
            </section>
            <section className="mt-3 space-y-2">
               <Card
                  className="flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-orange-200 p-0 text-center shadow-md"
                  loading={api_requests.isPending}
                  onClick={() => router.push(`history`)}
                  classNames={{
                     body: "w-full px-3",
                  }}
               >
                  <div className="flex w-full items-start justify-between">
                     <div className="flex flex-col items-start">
                        <div className="font-base text-lg">Tổng cộng</div>
                        <div className="mt-1.5 flex items-center">
                           <div className="text-2xl font-bold">
                              <CountUp end={Object.values(counts).reduce((acc, cur) => acc + cur, 0)} separator={","} />
                              <span className="ml-1 text-xs font-light">Yêu cầu</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center">
                        <Gear size={36} weight="duotone" className="text-orange-500" />
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-neutral-200 p-0 text-center shadow-md"
                  loading={api_requests.isPending}
                  onClick={() => router.push(`history?status=${FixRequestStatus.PENDING.toLowerCase()}`)}
                  classNames={{
                     body: "w-full px-3",
                  }}
               >
                  <div className="flex w-full items-start justify-between">
                     <div className="flex flex-col items-start">
                        <div className="font-base text-lg">{FixRequest_StatusData("pending").text}</div>
                        <div className="mt-1.5 flex items-center">
                           <div className="text-2xl font-bold">
                              <CountUp end={counts[FixRequestStatus.PENDING]} separator={","} />
                              <span className="ml-1 text-xs font-light">Yêu cầu</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center">
                        {
                           FixRequest_StatusData("pending", {
                              phosphor: { size: 36, weight: "duotone", className: "text-neutral-500" },
                           }).icon
                        }
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-green-200 p-0 text-center shadow-md"
                  loading={api_requests.isPending}
                  onClick={() => router.push(`history?status=${FixRequestStatus.APPROVED.toLowerCase()}`)}
                  classNames={{
                     body: "w-full px-3",
                  }}
               >
                  <div className="flex w-full items-start justify-between">
                     <div className="flex flex-col items-start">
                        <div className="font-base text-lg">{FixRequest_StatusData("approved").text}</div>
                        <div className="mt-1.5 flex items-center">
                           <div className="text-2xl font-bold">
                              <CountUp end={counts[FixRequestStatus.APPROVED]} separator={","} />
                              <span className="ml-1 text-xs font-light">Yêu cầu</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center">
                        {
                           FixRequest_StatusData("approved", {
                              phosphor: { size: 36, weight: "duotone", className: "text-green-500" },
                           }).icon
                        }
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-blue-200 p-0 text-center shadow-md"
                  loading={api_requests.isPending}
                  onClick={() => router.push(`history?status=${FixRequestStatus.IN_PROGRESS.toLowerCase()}`)}
                  classNames={{
                     body: "w-full px-3",
                  }}
               >
                  <div className="flex w-full items-start justify-between">
                     <div className="flex flex-col items-start">
                        <div className="font-base text-lg">{FixRequest_StatusData("in_progress").text}</div>
                        <div className="mt-1.5 flex items-center">
                           <div className="text-2xl font-bold">
                              <CountUp end={counts[FixRequestStatus.IN_PROGRESS]} separator={","} />
                              <span className="ml-1 text-xs font-light">Yêu cầu</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center">
                        {
                           FixRequest_StatusData("in_progress", {
                              phosphor: { size: 36, weight: "duotone", className: "text-blue-500" },
                           }).icon
                        }
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-purple-200 p-0 text-center shadow-md"
                  loading={api_requests.isPending}
                  onClick={() => router.push(`history?status=${FixRequestStatus.HEAD_CONFIRM.toLowerCase()}`)}
                  classNames={{
                     body: "w-full px-3",
                  }}
               >
                  <div className="flex w-full items-start justify-between">
                     <div className="flex flex-col items-start">
                        <div className="font-base text-lg">{FixRequest_StatusData("head_confirm").text}</div>
                        <div className="mt-1.5 flex items-center">
                           <div className="text-2xl font-bold">
                              <CountUp end={counts[FixRequestStatus.HEAD_CONFIRM]} separator={","} />
                              <span className="ml-1 text-xs font-light">Yêu cầu</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center">
                        {
                           FixRequest_StatusData("head_confirm", {
                              phosphor: { size: 36, weight: "duotone", className: "text-purple-500" },
                           }).icon
                        }
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-red-200 p-0 text-center shadow-md"
                  loading={api_requests.isPending}
                  onClick={() => router.push(`history?status=${FixRequestStatus.REJECTED.toLowerCase()}`)}
                  classNames={{
                     body: "w-full px-3",
                  }}
               >
                  <div className="flex w-full items-start justify-between">
                     <div className="flex flex-col items-start">
                        <div className="font-base text-lg">{FixRequest_StatusData("rejected").text}</div>
                        <div className="mt-1.5 flex items-center">
                           <div className="text-2xl font-bold">
                              <CountUp end={counts[FixRequestStatus.REJECTED]} separator={","} />
                              <span className="ml-1 text-xs font-light">Yêu cầu</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center">
                        {
                           FixRequest_StatusData("rejected", {
                              phosphor: { size: 36, weight: "duotone", className: "text-red-500" },
                           }).icon
                        }
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-neutral-200 p-0 text-center shadow-md"
                  loading={api_requests.isPending}
                  onClick={() => router.push(`history?status=${FixRequestStatus.CLOSED.toLowerCase()}`)}
                  classNames={{
                     body: "w-full px-3",
                  }}
               >
                  <div className="flex w-full items-start justify-between">
                     <div className="flex flex-col items-start">
                        <div className="font-base text-lg">{FixRequest_StatusData("closed").text}</div>
                        <div className="mt-1.5 flex items-center">
                           <div className="text-2xl font-bold">
                              <CountUp end={counts[FixRequestStatus.CLOSED]} separator={","} />
                              <span className="ml-1 text-xs font-light">Yêu cầu</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center">
                        {
                           FixRequest_StatusData("closed", {
                              phosphor: { size: 36, weight: "duotone", className: "text-neutral-500" },
                           }).icon
                        }
                     </div>
                  </div>
               </Card>
            </section>
         </div>
      </div>
   )
}

export default Page
