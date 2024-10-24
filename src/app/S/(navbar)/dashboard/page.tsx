"use client"

import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { Button } from "antd"
import { useRouter } from "next/navigation"
import { useMemo, useRef } from "react"
import TaskDetailsDrawer, {
   TaskDetailsDrawerRefType,
} from "../../../../features/staff/components/overlays/TaskDetails.drawer"
import StaffNavigationDrawer from "@/features/staff/components/layout/StaffNavigationDrawer"
import { FilterOutlined } from "@ant-design/icons"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import { CheckSquare } from "@phosphor-icons/react"
import ClickableArea from "@/components/ClickableArea"
import staff_uri from "@/features/staff/uri"
import staff_queries from "@/features/staff/queries"
import TaskStatisticsCard from "@/features/staff/components/TaskStatisticsCard"

function Page() {
   const navDrawer = StaffNavigationDrawer.useDrawer()
   const router = useRouter()

   const api_tasks = staff_queries.task.all({})

   const taskDetailsDrawerRef = useRef<TaskDetailsDrawerRefType | null>(null)

   const counts = useMemo(() => {
      const counts: {
         [key in TaskStatus]: number
      } = {
         [TaskStatus.ASSIGNED]: 0,
         [TaskStatus.CANCELLED]: 0,
         [TaskStatus.COMPLETED]: 0,
         [TaskStatus.HEAD_STAFF_CONFIRM]: 0,
         [TaskStatus.AWAITING_FIXER]: 0,
         [TaskStatus.AWAITING_SPARE_SPART]: 0,
         [TaskStatus.IN_PROGRESS]: 0,
      }
      api_tasks.data?.forEach((task) => {
         counts[task.status] += 1
      })
      return counts
   }, [api_tasks.data])

   const ongoingtask = useMemo(() => {
      if (!api_tasks.isSuccess) return
      const result = api_tasks.data?.filter((task) => task.status === TaskStatus.IN_PROGRESS)
      if (result.length > 0) return result[0]
      return null
   }, [api_tasks.data, api_tasks.isSuccess])

   return (
      <div className="relative">
         <div className="absolute left-0 top-0 h-56 w-full bg-staff" />
         <PageHeaderV2
            prevButton={<PageHeaderV2.MenuButton onClick={navDrawer.handleOpen} />}
            title={"Trang chủ"}
            type="light"
            nextButton={<Button icon={<FilterOutlined className="text-white" />} type="text" />}
         />
         <section className={"relative z-50 mb-3 px-layout"}>
            <ClickableArea
               className={"flex w-full justify-start rounded-lg bg-white p-2 text-black"}
               onClick={() => {
                  if (ongoingtask) {
                     router.push(staff_uri.stack.tasks_id(ongoingtask.id))
                  } else {
                     router.push(staff_uri.navbar.tasks)
                  }
               }}
            >
               <div>
                  <CheckSquare size={48} />
               </div>
               <div className={"flex w-full flex-col items-start"}>
                  <h2 className={"text-base font-semibold text-black"}>
                     {ongoingtask ? "Tác vụ đang thực hiện" : "Chọn tác vụ để bắt đầu"}
                  </h2>
                  <div className={"w-11/12 truncate text-left text-xs"}>
                     {ongoingtask ? ongoingtask.name : "Vui lòng bắt đầu một tác vụ trong danh sách"}
                  </div>
               </div>
            </ClickableArea>
         </section>
         <main className="px-layout">
            <TaskStatisticsCard counts={counts} />
         </main>
         <TaskDetailsDrawer ref={taskDetailsDrawerRef} />
      </div>
   )
}

export default Page
