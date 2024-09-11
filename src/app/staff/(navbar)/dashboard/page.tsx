"use client"

import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_All from "@/app/staff/_api/task/all.api"
import TaskCard from "@/app/staff/_components/TaskCard"
import HomeHeader from "@/common/components/HomeHeader"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { CalendarCheck, CalendarSlash, Gear, HourglassSimpleMedium, NotePencil, SealCheck } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { Card } from "antd"
import dayjs from "dayjs"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import CountUp from "react-countup"
import Image from "next/image"
import TaskDetailsDrawer, { TaskDetailsDrawerRefType } from "../../_components/TaskDetails.drawer"

export default dynamic(() => Promise.resolve(StaffDashboard), {
   ssr: false,
})

function useTask(current: number, pageSize: number, currentStatus: TaskStatus) {
   return useQuery({
      queryKey: staff_qk.task.all(),
      queryFn: () => Staff_Task_All(),
   })
}

function StaffDashboard() {
   const response = useQuery({
      queryKey: staff_qk.task.all(),
      queryFn: Staff_Task_All,
   })

   const router = useRouter()
   const currentDefault = 1,
      pageSizeDefault = 10

   const searchParams = useSearchParams()
   const [current, setCurrent] = useState(Number(searchParams.get("current")) || currentDefault)
   const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || pageSizeDefault)

   const taskDetailsDrawerRef = useRef<TaskDetailsDrawerRefType | null>(null)

   const ongoingtask = useMemo(() => {
      if (!response.isSuccess) return
      const result = response.data?.filter((task) => task.status === TaskStatus.IN_PROGRESS)
      if (result.length > 0) return result[0]
      return null
   }, [response.data, response.isSuccess])

   const awaitingFixerResult = useTask(current, pageSize, TaskStatus.AWAITING_FIXER)
   // const pendingStockResult = result(TaskStatus.PENDING_STOCK)
   const assignedResult = useTask(current, pageSize, TaskStatus.ASSIGNED)
   const inProgressResult = useTask(current, pageSize, TaskStatus.IN_PROGRESS)
   const headstaffConfirmResult = useTask(current, pageSize, TaskStatus.HEAD_STAFF_CONFIRM)
   const completedResult = useTask(current, pageSize, TaskStatus.COMPLETED)
   const cancelledResult = useTask(current, pageSize, TaskStatus.CANCELLED)

   const totalTasks = [
      awaitingFixerResult.data?.length ?? 0,
      // pendingStockResult.data?.length ?? 0,
      assignedResult.data?.length ?? 0,
      inProgressResult.data?.length ?? 0,
      completedResult.data?.length ?? 0,
      headstaffConfirmResult.data?.length ?? 0,
      cancelledResult.data?.length ?? 0,
   ].reduce((acc, curr) => acc + curr, 0)

   const progressingTasks = inProgressResult.data?.length ?? 0
   const completedTasks = completedResult.data?.length ?? 0
   const headstaffConfirmTasks = headstaffConfirmResult.data?.length ?? 0
   const assignedTasks = assignedResult.data?.length ?? 0
   const cancelledTasks = cancelledResult.data?.length ?? 0

   const tasksToday = useMemo(() => {
      if (!response.isSuccess) return []
      return response.data?.filter((task: TaskDto) => dayjs(task.fixerDate).isSame(dayjs(), "day"))
   }, [response.data, response.isSuccess])

   return (
      <div className="std-layout">
         <div className="std-layout-outer">
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
         <div>
            {ongoingtask && (
               <section className="mb-8 mt-5 flex space-x-4">
                  <TaskCard
                     className="h-full w-full flex-1 shadow-fb"
                     title="Tác vụ đang thực hiện"
                     description={ongoingtask?.name ?? ""}
                     priority={ongoingtask?.priority ?? false}
                     onClick={() => router.push(`/staff/tasks/${ongoingtask.id}/start`)}
                  />
               </section>
            )}
            <div>
               <section>
                  <h2 className="text-2xl font-semibold">Dashboard</h2>
               </section>
               {/* <section className="flex-none space-y-2">
                  <Card
                     className="mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-neutral-200 p-0 text-center shadow-md"
                     loading={
                        awaitingFixerResult.isLoading ||
                        assignedResult.isLoading ||
                        inProgressResult.isLoading ||
                        completedResult.isLoading ||
                        cancelledResult.isLoading
                     }
                     onClick={() => router.push("tasks")}
                     classNames={{
                        body: "w-full",
                     }}
                  >
                     <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col items-start">
                           <div className="flex items-center">
                              <div className="text-3xl font-bold">
                                 <CountUp end={totalTasks} separator={","} />
                              </div>
                           </div>
                           <div className="text-xl">Tổng cộng</div>
                        </div>
                        <div className="flex items-center">
                           <Gear size={45} weight="duotone" />
                        </div>
                     </div>
                  </Card>
                  <Card
                     className="mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-blue-200 p-0 text-center shadow-md"
                     loading={assignedResult.isLoading}
                     onClick={() => router.push("tasks")}
                     classNames={{
                        body: "w-full",
                     }}
                  >
                     <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col items-start">
                           <div className="flex items-center">
                              <div className="text-3xl font-bold">
                                 <CountUp end={assignedTasks} separator={","} />
                              </div>
                           </div>
                           <div className="text-xl">Đã phân công</div>
                        </div>
                        <div className="flex items-center">
                           <NotePencil size={45} weight="duotone" />
                        </div>
                     </div>
                  </Card>
                  <Card
                     className="mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-orange-200 p-0 text-center shadow-md"
                     loading={inProgressResult.isLoading}
                     onClick={() => router.push("tasks")}
                     classNames={{
                        body: "w-full",
                     }}
                  >
                     <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col items-start">
                           <div className="flex items-center">
                              <div className="text-3xl font-bold">
                                 <CountUp end={progressingTasks} separator={","} />
                              </div>
                           </div>
                           <div className="text-xl">Đang làm</div>
                        </div>
                        <div className="flex items-center">
                           <CalendarCheck size={45} />
                        </div>
                     </div>
                  </Card>
                  <Card
                     className="mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-green-200 p-0 text-center shadow-md"
                     loading={completedResult.isLoading}
                     onClick={() => router.push("tasks")}
                     classNames={{
                        body: "w-full",
                     }}
                  >
                     <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col items-start">
                           <div className="flex items-center">
                              <div className="text-3xl font-bold">
                                 <CountUp end={completedTasks} separator={","} />
                              </div>
                           </div>
                           <div className="text-xl">Hoàn thành</div>
                        </div>
                        <div className="flex items-center">
                           <HourglassSimpleMedium size={45} weight="duotone" />
                        </div>
                     </div>
                  </Card>
                  <Card
                     className="mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-purple-200 p-0 text-center shadow-md"
                     loading={headstaffConfirmResult.isLoading}
                     onClick={() => router.push("tasks")}
                     classNames={{
                        body: "w-full",
                     }}
                  >
                     <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col items-start">
                           <div className="flex items-center">
                              <div className="text-3xl font-bold">
                                 <CountUp end={headstaffConfirmTasks} separator={","} />
                              </div>
                           </div>
                           <div className="text-xl">Chờ kiểm tra</div>
                        </div>
                        <div className="flex items-center">
                           <SealCheck size={45} />
                        </div>
                     </div>
                  </Card>
                  <Card
                     className="mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-red-200 p-0 text-center shadow-md"
                     loading={cancelledResult.isLoading}
                     onClick={() => router.push("tasks")}
                     classNames={{
                        body: "w-full",
                     }}
                  >
                     <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col items-start">
                           <div className="flex items-center">
                              <div className="text-3xl font-bold">
                                 <CountUp end={cancelledTasks} separator={","} />
                              </div>
                           </div>
                           <div className="text-xl">Đã hủy</div>
                        </div>
                        <div className="flex items-center">
                           <CalendarSlash size={45} weight="duotone" />
                        </div>
                     </div>
                  </Card>
               </section> */}
            </div>
         </div>
         <TaskDetailsDrawer ref={taskDetailsDrawerRef} />
      </div>
   )
}
