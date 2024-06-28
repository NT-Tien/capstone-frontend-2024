"use client"

import HomeHeader from "@/common/components/HomeHeader"
import { Card, Skeleton } from "antd"
import { useQuery } from "@tanstack/react-query"
import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_All from "@/app/staff/_api/task/all.api"
import { TaskStatus } from "@/common/enum/task-status.enum"
import TaskCard from "@/app/staff/_components/TaskCard"
import TaskDetailsDrawer from "@/app/staff/_components/TaskDetails.drawer"

export default function StaffDashboard() {
   const response = useQuery({
      queryKey: staff_qk.task.all(),
      queryFn: Staff_Task_All,
      select: (data) => {
         const result = data.filter((task) => task.status === TaskStatus.IN_PROGRESS)
         if (result.length > 0) return result[0]
         return null
      },
   })

   return (
      <div
         style={{
            display: "grid",
            gridTemplateColumns: "[outer-start] 16px [inner-start] 1fr [inner-end] 16px [outer-end]",
         }}
      >
         <HomeHeader
            className="p-4"
            style={{
               gridColumn: "outer-start / outer-end",
            }}
         />
         {response.data !== null ? (
            <TaskDetailsDrawer>
               {(handleOpen) => (
                  <TaskCard
                     title="Ongoing Task"
                     description={response.data?.name ?? ""}
                     priority={response.data?.priority ?? false}
                     onClick={() => handleOpen(response.data?.id ?? "", true)}
                     style={{
                        gridColumn: "inner-start / inner-end",
                     }}
                  />
               )}
            </TaskDetailsDrawer>
         ) : (
            <Card
               style={{
                  gridColumn: "inner-start / inner-end",
               }}
            >
               You have no ongoing tasks
            </Card>
         )}
         <div
            className="mt-4 grid grid-cols-3 gap-4"
            style={{
               gridColumn: "inner-start / inner-end",
            }}
         >
            <Skeleton.Button className="aspect-square h-max w-full" />
            <Skeleton.Button className="aspect-square h-max w-full" />
            <Skeleton.Button className="aspect-square h-max w-full" />
         </div>
      </div>
   )
}
