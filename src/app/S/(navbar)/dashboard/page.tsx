"use client"

import ClickableArea from "@/components/ClickableArea"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import StaffNavigationDrawer from "@/features/staff/components/layout/StaffNavigationDrawer"
import TaskStatisticsCard from "@/features/staff/components/TaskStatisticsCard"
import staff_queries from "@/features/staff/queries"
import staff_uri from "@/features/staff/uri"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { CalendarCheck, CheckSquare, MapPin } from "@phosphor-icons/react"
import { Divider, Progress, Space, Typography } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useMemo, useRef } from "react"
import { LoadingOutlined } from "@ant-design/icons"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import TaskViewDetails_FixDrawer, {
   TaskViewDetails_FixDrawerProps,
} from "@/features/staff/components/overlays/TaskViewDetails_Fix.drawer"
import TaskViewDetails_RenewDrawer, {
   TaskViewDetails_RenewDrawerProps,
} from "@/features/staff/components/overlays/renew/TaskViewDetails_Renew.drawer"
import TaskViewDetails_WarrantyDrawer, {
   TaskViewDetails_WarrantyDrawerProps,
} from "@/features/staff/components/overlays/warranty/TaskViewDetails_Warranty.drawer"

function Page() {
   const navDrawer = StaffNavigationDrawer.useDrawer()
   const router = useRouter()

   const api_tasks = staff_queries.task.all({})
   const api_tasks_inProgress = staff_queries.task.allInProgress({})

   const control_taskViewDetails_Fix = useRef<RefType<TaskViewDetails_FixDrawerProps>>(null)
   const control_taskViewDetails_Warranty = useRef<RefType<TaskViewDetails_WarrantyDrawerProps>>(null)
   const control_taskViewDetails_Renew = useRef<RefType<TaskViewDetails_RenewDrawerProps>>(null)

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

   const todayTasks = useMemo(() => {
      return api_tasks.data?.filter((t) => dayjs(t.fixerDate).isSame(dayjs(), "day"))
   }, [api_tasks.data])

   function handleTaskClick(task: TaskDto) {
      if (TaskUtil.isTask_Fix(task)) {
         control_taskViewDetails_Fix.current?.handleOpen({
            taskId: task.id,
         })
         return
      }

      if (TaskUtil.isTask_Warranty(task)) {
         control_taskViewDetails_Warranty.current?.handleOpen({
            taskId: task.id,
         })
         return
      }

      if (TaskUtil.isTask_Renew(task)) {
         control_taskViewDetails_Renew.current?.handleOpen({
            taskId: task.id,
         })
         return
      }
   }

   const currentTask = api_tasks_inProgress.data?.[0]

   return (
      <div className="relative">
         <div className="absolute left-0 top-0 h-56 w-full bg-staff" />
         <PageHeaderV2
            prevButton={<PageHeaderV2.MenuButton onClick={navDrawer.handleOpen} />}
            title={"Trang chủ"}
            type="light"
            // nextButton={<Button icon={<FilterOutlined className="text-white" />} type="text" />}
         />
         <section className={"relative z-50 mb-3 w-full px-layout"}>
            {currentTask ? (
               <div className="w-full">
                  <div className="inline rounded-t-lg bg-white px-4 py-1 font-medium text-orange-500 shadow-lg">
                     <LoadingOutlined className="mr-1.5" />
                     Tác vụ đang thực hiện
                  </div>
                  <ClickableArea
                     reset={true}
                     className="flex h-20 w-full justify-start gap-3 rounded-lg rounded-tl-none border-[2px] border-staff bg-orange-600 p-3 text-left text-white shadow-lg"
                     onClick={() => handleTaskClick(currentTask)}
                  >
                     <Progress
                        type="circle"
                        percent={TaskUtil.getPercentageFinished(currentTask)}
                        size={52}
                        className="text-white"
                        format={(percent) => <span className="text-xs font-medium text-white">{percent}%</span>}
                        strokeWidth={10}
                        strokeColor={"#92400e"}
                     />
                     <div className="flex flex-grow flex-col gap-1 overflow-hidden">
                        <Typography.Text
                           className="w-full text-base font-medium text-white"
                           ellipsis={{
                              suffix: currentTask.name.slice(currentTask.name.length - 6, currentTask.name.length),
                           }}
                        >
                           {currentTask.name}
                        </Typography.Text>
                        <Space
                           wrap
                           size="small"
                           className="text-xs text-neutral-100"
                           split={<Divider type="vertical" className="m-0" />}
                        >
                           <div className="flex items-center gap-1.5">
                              <MapPin size={14} weight="fill" />
                              <span>
                                 {currentTask.device?.area?.name ?? "-"} ({currentTask.device?.positionX ?? "-"},{" "}
                                 {currentTask.device?.positionY ?? "-"})
                              </span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <CalendarCheck size={14} weight="fill" />
                              <span>{dayjs(currentTask.fixerDate).format("DD/MM/YYYY")}</span>
                           </div>
                        </Space>
                     </div>
                  </ClickableArea>
               </div>
            ) : (
               <ClickableArea
                  reset={true}
                  className="flex h-20 w-full justify-start gap-2 rounded-lg border-[1px] border-orange-700/50 bg-orange-200 p-2 shadow-lg"
                  onClick={() => router.push(staff_uri.navbar.tasks)}
                  type="dashed"
               >
                  <CheckSquare className="flex-shrink-0" size={48} weight="fill" />
                  <div className="flex flex-col">
                     <h2 className="text-base font-semibold">Chưa bắt đầu tác vụ</h2>
                     <p className="text-xs whitespace-pre-wrap">
                        {todayTasks?.length
                           ? `Bạn có ${todayTasks?.length ?? 0} tác vụ cần hoàn thành hôm nay`
                           : "Bạn không có tác vụ cần hoàn thành hôm nay"}
                     </p>
                  </div>
               </ClickableArea>
            )}
         </section>
         <main className="px-layout">
            <TaskStatisticsCard counts={counts} />
         </main>
         <OverlayControllerWithRef ref={control_taskViewDetails_Fix}>
            <TaskViewDetails_FixDrawer />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_taskViewDetails_Renew}>
            <TaskViewDetails_RenewDrawer />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_taskViewDetails_Warranty}>
            <TaskViewDetails_WarrantyDrawer />
         </OverlayControllerWithRef>
      </div>
   )
}

export default Page
