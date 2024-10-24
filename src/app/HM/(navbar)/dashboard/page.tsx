"use client"

import HeadMaintenanceNavigaionDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import { Button, Space, Statistic, Tabs } from "antd"
import { CheckSquareOutlined, FilterOutlined, InboxOutlined, LikeOutlined } from "@ant-design/icons"
import ClickableArea from "@/components/ClickableArea"
import RequestStatisticsCard from "@/features/head-maintenance/components/RequestStatisticsCard"
import { useMemo, useState } from "react"
import TaskStatisticsCard from "@/features/head-maintenance/components/TaskStatisticsCard"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { cn } from "@/lib/utils/cn.util"

function Page() {
   const navDrawer = HeadMaintenanceNavigaionDrawer.useDrawer()
   const [tab, setTab] = useState<"request" | "task">("request")

   const api_counts = head_maintenance_queries.dashboard.count({})

   const totalRequests = useMemo(() => {
      if (!api_counts.isSuccess) return 0

      return (
         api_counts.data?.pendingRequests +
         api_counts.data?.approvedRequests +
         api_counts.data?.inProgressRequests +
         api_counts.data?.headConfirmRequests +
         api_counts.data?.closedRequests +
         api_counts.data?.rejectedRequests
      )
   }, [
      api_counts.data?.approvedRequests,
      api_counts.data?.closedRequests,
      api_counts.data?.headConfirmRequests,
      api_counts.data?.inProgressRequests,
      api_counts.data?.pendingRequests,
      api_counts.data?.rejectedRequests,
      api_counts.isSuccess,
   ])

   const totalTasks = useMemo(() => {
      if (!api_counts.isSuccess) return 0

      return (
         api_counts.data?.awaitingFixerTasks +
         api_counts.data?.awaitingSparePartTasks +
         api_counts.data?.assignedTasks +
         api_counts.data?.inProgressTasks +
         api_counts.data?.headStaffConfirmTasks +
         (api_counts.data?.completedTasks ?? 0)
      )
   }, [
      api_counts.data?.assignedTasks,
      api_counts.data?.awaitingFixerTasks,
      api_counts.data?.awaitingSparePartTasks,
      api_counts.data?.completedTasks,
      api_counts.data?.headStaffConfirmTasks,
      api_counts.data?.inProgressTasks,
      api_counts.isSuccess,
   ])

   return (
      <div className="relative">
         <div className="absolute left-0 top-0 h-56 w-full bg-head_maintenance" />
         <PageHeaderV2
            prevButton={<PageHeaderV2.MenuButton onClick={navDrawer.handleOpen} />}
            title={"Thống kê"}
            nextButton={<Button icon={<FilterOutlined className="text-white" />} type="text" />}
         />
         <section className={"grid grid-cols-2 gap-3 px-layout"}>
            <ClickableArea
               type={"primary"}
               className={cn(
                  "block h-24 shadow-md",
                  tab === "request" ? "border-4 border-green-700 bg-green-200" : "bg-neutral-50",
               )}
               onClick={() => setTab("request")}
            >
               <Statistic title="Yêu cầu" value={totalRequests} prefix={<InboxOutlined />} />
            </ClickableArea>
            <ClickableArea
               type={"primary"}
               className={cn(
                  "block h-24 shadow-md",
                  tab === "task" ? "border-4 border-green-700 bg-green-200" : "bg-neutral-50",
               )}
               onClick={() => setTab("task")}
            >
               <Statistic title="Tác vụ" value={totalTasks} prefix={<CheckSquareOutlined />} />
            </ClickableArea>
         </section>
         <section className={"mt-3 flex justify-center text-white"}>
            {tab === "request" && <RequestStatisticsCard className="px-layout" />}
            {tab === "task" && <TaskStatisticsCard className={"px-layout"} />}
         </section>
      </div>
   )
}

export default Page
