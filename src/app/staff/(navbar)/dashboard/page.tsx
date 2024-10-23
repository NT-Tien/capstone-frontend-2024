"use client"

import staff_qk from "@/features/staff/api/qk"
import Staff_Task_All from "@/features/staff/api/task/all.api"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { useQuery } from "@tanstack/react-query"
import { Button, Space } from "antd"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useMemo, useRef } from "react"
import CountUp from "react-countup"
import TaskDetailsDrawer, {
   TaskDetailsDrawerRefType,
} from "../../../../features/staff/components/overlays/TaskDetails.drawer"
import StaffNavigationDrawer from "@/features/staff/components/layout/StaffNavigationDrawer"
import { FilterOutlined, MenuOutlined, CompassFilled } from "@ant-design/icons"

export default dynamic(() => Promise.resolve(StaffDashboard), {
   ssr: false,
})


function StaffDashboard() {
   const response = useQuery({
      queryKey: staff_qk.task.all(),
      queryFn: Staff_Task_All,
   })
   const navDrawer = StaffNavigationDrawer.useDrawer()
   const router = useRouter()

   const taskDetailsDrawerRef = useRef<TaskDetailsDrawerRefType | null>(null)

   const counts = useMemo(() => {
      const counts: {
         [key in TaskStatus] : number
      } = {
         [TaskStatus.ASSIGNED] : 0,
         [TaskStatus.CANCELLED] : 0,
         [TaskStatus.COMPLETED] : 0,
         [TaskStatus.HEAD_STAFF_CONFIRM] : 0,
         [TaskStatus.AWAITING_FIXER] : 0,
         [TaskStatus.AWAITING_SPARE_SPART] : 0,
         [TaskStatus.IN_PROGRESS] : 0
      }
      response.data?.forEach((task) => {
         counts[task.status] += 1
      })
      return counts
   }, [response.data])
   const ongoingtask = useMemo(() => {
      if (!response.isSuccess) return
      const result = response.data?.filter((task) => task.status === TaskStatus.IN_PROGRESS)
      if (result.length > 0) return result[0]
      return null
   }, [response.data, response.isSuccess])

   const totalRelevantTasks = useMemo(() => {
      return (
        counts[TaskStatus.ASSIGNED] +
        counts[TaskStatus.CANCELLED] +
        counts[TaskStatus.COMPLETED] +
        counts[TaskStatus.HEAD_STAFF_CONFIRM]
      );
    }, [counts]);
   return (
      <div className="relative">
         <section className="bg-staff p-layout pb-20 text-white">
            <header className="flex items-center justify-between">
               <Button
                  icon={<MenuOutlined className="text-white"></MenuOutlined>}
                  type="text"
                  onClick={navDrawer.handleOpen}
               />
               <h1 className="text-lg font-bold">Trang chủ</h1>
               <Button icon={<FilterOutlined className="text-white" />} type="text" />
            </header>
            <section className="my-5 flex flex-col items-center justify-center">
               <h2 className="text-base">Tổng số tác vụ</h2>
               <div className="mt-1 flex items-center gap-2 text-2xl">
                  <CompassFilled />
                  <CountUp end={totalRelevantTasks} />
               </div>
            </section>
         </section>
         <main className="relative px-layout pt-[120px]">
            <div className="absolute -top-20 left-0 px-layout">
               <article className="w-full text-black">
                  <Space.Compact className="w-full">
                     <Button
                        block
                        className="grid h-max place-items-center gap-0 rounded-none rounded-tl-lg py-4 text-base"
                     >
                        <div>{counts.ASSIGNED}</div>
                        <div>Chưa thực hiện</div>
                     </Button>
                     <Button
                        block
                        className="grid h-max place-items-center gap-0 rounded-none rounded-tr-lg py-4 text-base"
                     >
                        <div>{counts.COMPLETED}</div>
                        <div>Hoàn thành</div>
                     </Button>
                  </Space.Compact>
                  <Space.Compact direction="vertical" className="w-full">
                     <Button block className="flex justify-between rounded-none py-5 text-sm">
                        <div>Chờ đánh giá</div>
                        <div>{counts.HEAD_STAFF_CONFIRM}</div>
                     </Button>
                     <Button block className="flex justify-between rounded-none rounded-b-lg py-5 text-sm">
                        <div>Đã hủy</div>
                        <div>{counts.CANCELLED}</div>
                     </Button>
                  </Space.Compact>
               </article>
            </div>
            <div>
               {ongoingtask && (
                  <section className="mb-8 mt-1 flex space-x-4">
                     <div
                        className="relative h-full w-full flex-1 transform cursor-pointer rounded-xl p-5 shadow-lg transition duration-300 hover:scale-105 hover:shadow-2xl"
                        style={{
                           background: "radial-gradient(circle at top left, #FCD34D, #D97706)", // Matches yellow-300 and amber-700
                        }}
                        onClick={() => router.push(`/staff/tasks/${ongoingtask.id}/start`)}
                     >
                        <h2 className="text-xl font-bold text-white">Tác vụ đang thực hiện</h2>
                        <p className="text-base text-white">{ongoingtask?.name ?? ""}</p>
                        {ongoingtask?.priority && (
                           <div className="absolute right-2 top-2 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                              Ưu tiên
                           </div>
                        )}
                     </div>
                  </section>
               )}
            </div>
            <TaskDetailsDrawer ref={taskDetailsDrawerRef} />
         </main>
      </div>
   )
}
