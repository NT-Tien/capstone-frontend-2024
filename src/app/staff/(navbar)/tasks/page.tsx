"use client"

import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_All from "@/app/staff/_api/task/all.api"
import TaskCard from "@/app/staff/_components/TaskCard"
import TaskDetailsDrawer from "@/app/staff/_components/TaskDetails.drawer"
import RootHeader from "@/common/components/RootHeader"
import ScrollableTabs from "@/common/components/ScrollableTabs"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { cn } from "@/common/util/cn.util"
import { CalendarOutlined, CheckCircleFilled, EnvironmentFilled, ExclamationCircleFilled } from "@ant-design/icons"
import { SkipForward } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { Card, Empty, Progress, Skeleton } from "antd"
import dayjs from "dayjs"
import { useMemo, useState } from "react"
import { taskPercentCalculator } from "../../../../common/util/taskPercentCalculator.util"

type TasksType = {
   today_priority: TaskDto[]
   today_normal: TaskDto[]
   others_priority: TaskDto[]
   others_normal: TaskDto[]
   ongoing: TaskDto | null
   hasPast: boolean
   checking: TaskDto[]
}

export default function StaffTasksPage() {
   const [tab, setTab] = useState("today")

   const api_tasks = useQuery({
      queryKey: staff_qk.task.all(),
      queryFn: Staff_Task_All,
   })

   const tasks = useMemo(() => {
      const result: TasksType = {
         today_priority: [],
         today_normal: [],
         others_priority: [],
         others_normal: [],
         ongoing: null,
         hasPast: false,
         checking: [],
      }

      if (!api_tasks.isSuccess) return result
      const now = dayjs()

      api_tasks.data.forEach((task) => {
         if (task.status === TaskStatus.IN_PROGRESS) {
            result.ongoing = task
            return
         }
         if (task.status === TaskStatus.HEAD_STAFF_CONFIRM) {
            result.checking.push(task)
            return
         }
         if (task.status !== TaskStatus.ASSIGNED) return // we'll only show unstarted tasks.

         const fixerDate = dayjs(task.fixerDate).add(7, "hours")

         if (fixerDate.isBefore(now, "day")) {
            result.hasPast = false
         }

         if (fixerDate.isBefore(now, "day") || fixerDate.isSame(now, "day")) {
            result[task.priority ? "today_priority" : "today_normal"].push(task)
         } else {
            result[task.priority ? "others_priority" : "others_normal"].push(task)
         }
      })

      result.today_normal.sort((a, b) =>
         dayjs(a.fixerDate).add(7, "hours").isBefore(dayjs(b.fixerDate).add(7, "hours")) ? 1 : -1,
      )
      result.today_priority.sort((a, b) =>
         dayjs(a.fixerDate).add(7, "hours").isBefore(dayjs(b.fixerDate).add(7, "hours")) ? 1 : -1,
      )
      result.others_normal.sort((a, b) =>
         dayjs(a.fixerDate).add(7, "hours").isBefore(dayjs(b.fixerDate).add(7, "hours")) ? 1 : -1,
      )
      result.others_priority.sort((a, b) =>
         dayjs(a.fixerDate).add(7, "hours").isBefore(dayjs(b.fixerDate).add(7, "hours")) ? 1 : -1,
      )

      return result
   }, [api_tasks.data, api_tasks.isSuccess])

   return (
      <TaskDetailsDrawer>
         {(handleOpen) => (
            <div className="std-layout">
               <RootHeader title="Tác vụ" className="std-layout-outer p-4" />
               {!!tasks.ongoing && (
                  <section className="std-layout-outer w-full bg-white p-layout shadow-bottom">
                     <TaskCard
                        title="Tác vụ đang thực hiện"
                        description={tasks.ongoing.name}
                        bottom={<Progress percent={taskPercentCalculator(tasks.ongoing)} />}
                        priority={tasks.ongoing.priority ?? false}
                        onClick={() =>
                           handleOpen({
                              taskId: tasks.ongoing?.id ?? "",
                           })
                        }
                     />
                  </section>
               )}
               <ScrollableTabs
                  className="std-layout-outer sticky left-0 top-0 z-50"
                  classNames={{
                     content: "mt-layout",
                  }}
                  tab={tab}
                  onTabChange={setTab}
                  items={[
                     {
                        key: "today",
                        title: "Hôm nay",
                        icon: <CalendarOutlined />,
                        badge: tasks.today_priority.length + tasks.today_normal.length,
                     },
                     {
                        key: "others",
                        title: "Tương lai",
                        icon: <SkipForward size={16} />,
                        badge: tasks.others_priority.length + tasks.others_normal.length,
                     },
                     {
                        key: "checking",
                        title: "Đang kiểm tra",
                        icon: <CheckCircleFilled />,
                        badge: tasks.checking.length,
                     },
                  ]}
               />
               {tab === "today" && (
                  <div className="flex flex-col gap-6">
                     <section>
                        <h2 className="flex w-max items-center gap-2 rounded-md rounded-bl-none bg-red-500 px-3 py-0.5 text-sub-base font-semibold text-white">
                           <ExclamationCircleFilled className="text-sm" />
                           Ưu tiên
                        </h2>
                        {tasks.today_priority.length === 0 ? (
                           <>
                              <Card
                                 loading={api_tasks.isPending}
                                 size="small"
                                 className="rounded-tl-none border-red-500 bg-red-50"
                              >
                                 Không có tác vụ ưu tiên
                              </Card>
                              <Skeleton paragraph={false} active={api_tasks.isPending} loading={api_tasks.isPending} />
                           </>
                        ) : (
                           tasks.today_priority.map((item) => {
                              const fixerDate = dayjs(item.fixerDate).add(7, "hours")
                              const isDisabled =
                                 (tasks.hasPast && fixerDate.isSame(dayjs(), "day")) || tasks.ongoing !== null // if has past then disable present

                              return (
                                 <>
                                    <Card
                                       loading={api_tasks.isPending}
                                       key={item.id}
                                       hoverable
                                       size="small"
                                       className={cn(
                                          "rounded-tl-none border-r-4 border-red-300 bg-red-50",
                                          isDisabled && "opacity-50",
                                       )}
                                       onClick={() =>
                                          !isDisabled &&
                                          handleOpen({
                                             taskId: item.id,
                                          })
                                       }
                                    >
                                       <div className="flex flex-col">
                                          <section>
                                             <h3 className="text-base font-medium">{item.name}</h3>
                                          </section>
                                          <section className="mt-1 flex w-full items-center justify-between text-neutral-500">
                                             <span className="flex items-center gap-1">
                                                <EnvironmentFilled className="text-xs" />
                                                {item.device.area.name}
                                             </span>
                                             <span>{item.totalTime} phút</span>
                                          </section>
                                       </div>
                                    </Card>
                                    <Skeleton
                                       paragraph={false}
                                       active={api_tasks.isPending}
                                       loading={api_tasks.isPending}
                                    />
                                 </>
                              )
                           })
                        )}
                     </section>
                     {/* normal tasks */}
                     <section>
                        <h2 className="flex w-max items-center gap-2 rounded-md rounded-bl-none bg-neutral-500 px-3 py-0.5 text-sub-base font-medium text-white">
                           <CheckCircleFilled className="text-sm" />
                           Bình thường
                        </h2>
                        {tasks.today_normal.length === 0 ? (
                           <>
                              <Card
                                 loading={api_tasks.isPending}
                                 size="small"
                                 className="rounded-tl-none border-neutral-500 bg-neutral-50"
                              >
                                 Không có tác vụ ưu tiên
                              </Card>
                              <Skeleton paragraph={false} active={api_tasks.isPending} loading={api_tasks.isPending} />
                           </>
                        ) : (
                           tasks.today_normal.map((item, index) => {
                              const isDisabled = tasks.today_priority.length !== 0 || tasks.ongoing !== null

                              return (
                                 <Card
                                    key={item.id}
                                    size="small"
                                    className={cn(
                                       "border-default-500 bg-default-50 cursor-pointer border-r-4 transition-all hover:border-primary-300 hover:bg-primary-50",
                                       index === 0 ? "rounded-tl-none" : "mt-1",
                                       isDisabled && "opacity-50",
                                    )}
                                    classNames={{
                                       body: "pb-2",
                                    }}
                                    onClick={() =>
                                       !isDisabled
                                          ? handleOpen({
                                               taskId: item.id,
                                            })
                                          : null
                                    }
                                 >
                                    <div className="flex flex-col">
                                       <section>
                                          <h3 className="text-base font-medium">{item.name}</h3>
                                       </section>
                                       <section className="mt-1 flex w-full items-center justify-between text-neutral-500">
                                          <span className="flex items-center gap-1">
                                             <EnvironmentFilled className="text-xs" />
                                             {item.device.area.name}
                                          </span>
                                          <span>{item.totalTime} phút</span>
                                       </section>
                                       {!dayjs(item.fixerDate).add(7, "hours").isSame(dayjs(), "day") && (
                                          <section className="mt-1 text-right">
                                             <span className="text-xs text-neutral-500">
                                                {dayjs(item.fixerDate).add(7, "hours").format("DD/MM/YY")}
                                             </span>
                                          </section>
                                       )}
                                    </div>
                                 </Card>
                              )
                           })
                        )}
                     </section>
                  </div>
               )}
               {tab === "others" && (
                  <div className="flex flex-col gap-6">
                     <section>
                        <h2 className="flex w-max items-center gap-2 rounded-md rounded-bl-none bg-red-500 px-3 py-0.5 text-sub-base font-semibold text-white">
                           <ExclamationCircleFilled className="text-sm" />
                           Ưu tiên
                        </h2>
                        {tasks.others_priority.length === 0 ? (
                           <>
                              <Card
                                 loading={api_tasks.isPending}
                                 size="small"
                                 className="rounded-tl-none border-red-500 bg-red-50"
                              >
                                 Không có tác vụ ưu tiên
                              </Card>
                              <Skeleton paragraph={false} active={api_tasks.isPending} loading={api_tasks.isPending} />
                           </>
                        ) : (
                           tasks.others_priority.map((item) => {
                              const isDisabled =
                                 tasks.today_priority.length + tasks.today_normal.length !== 0 || tasks.ongoing !== null

                              return (
                                 <>
                                    <Card
                                       loading={api_tasks.isPending}
                                       key={item.id}
                                       hoverable
                                       size="small"
                                       className={cn(
                                          "rounded-tl-none border-r-4 border-red-300 bg-red-50",
                                          isDisabled && "opacity-50",
                                       )}
                                       onClick={() => !isDisabled && handleOpen({
                                          taskId: item.id
                                       })}
                                    >
                                       <div className="flex flex-col">
                                          <section>
                                             <h3 className="text-base font-medium">{item.name}</h3>
                                          </section>
                                          <section className="mt-1 flex w-full items-center justify-between text-neutral-500">
                                             <span className="flex items-center gap-1">
                                                <EnvironmentFilled className="text-xs" />
                                                {item.device.area.name}
                                             </span>
                                             <span>{item.totalTime} phút</span>
                                          </section>
                                       </div>
                                    </Card>
                                    <Skeleton
                                       paragraph={false}
                                       active={api_tasks.isPending}
                                       loading={api_tasks.isPending}
                                    />
                                 </>
                              )
                           })
                        )}
                     </section>
                     <section>
                        <h2 className="flex w-max items-center gap-2 rounded-md rounded-bl-none bg-neutral-500 px-3 py-0.5 text-sub-base font-medium text-white">
                           <CheckCircleFilled className="text-sm" />
                           Bình thường
                        </h2>
                        {tasks.others_normal.length === 0 ? (
                           <>
                              <Card
                                 loading={api_tasks.isPending}
                                 size="small"
                                 className="rounded-tl-none border-neutral-500 bg-neutral-50"
                              >
                                 Không có tác vụ ưu tiên
                              </Card>
                              <Skeleton paragraph={false} active={api_tasks.isPending} loading={api_tasks.isPending} />
                           </>
                        ) : (
                           tasks.others_normal.map((item, index) => {
                              const isDisabled =
                                 tasks.others_priority.length !== 0 ||
                                 tasks.today_priority.length + tasks.today_normal.length !== 0 ||
                                 tasks.ongoing !== null

                              return (
                                 <>
                                    <Card
                                       loading={api_tasks.isPending}
                                       key={item.id}
                                       size="small"
                                       className={cn(
                                          "border-default-500 bg-default-50 cursor-pointer border-r-4 transition-all hover:border-primary-300 hover:bg-primary-50",
                                          index === 0 ? "rounded-tl-none" : "mt-1",
                                          isDisabled && "opacity-50",
                                       )}
                                       classNames={{
                                          body: "pb-2",
                                       }}
                                       onClick={() => (!isDisabled ? handleOpen({
                                          taskId: item.id
                                       }) : null)}
                                    >
                                       <div className="flex flex-col">
                                          <section>
                                             <h3 className="text-base font-medium">{item.name}</h3>
                                          </section>
                                          <section className="mt-1 flex w-full items-center justify-between text-neutral-500">
                                             <span className="flex items-center gap-1">
                                                <EnvironmentFilled className="text-xs" />
                                                {item.device.area.name}
                                             </span>
                                             <span>{item.totalTime} phút</span>
                                          </section>
                                          {!dayjs(item.fixerDate).add(7, "hours").isSame(dayjs(), "day") && (
                                             <section className="mt-1 text-right">
                                                <span className="text-xs text-neutral-500">
                                                   {dayjs(item.fixerDate).add(7, "hours").format("DD/MM/YY")}
                                                </span>
                                             </section>
                                          )}
                                       </div>
                                    </Card>
                                    <Skeleton
                                       paragraph={false}
                                       active={api_tasks.isPending}
                                       loading={api_tasks.isPending}
                                    />
                                 </>
                              )
                           })
                        )}
                     </section>
                  </div>
               )}
               {tab === "checking" && (
                  <TaskDetailsDrawer>
                     {(handleOpenInner) => (
                        <div className="flex flex-col gap-6">
                           {tasks.checking.length === 0 ? (
                              <>
                                 <Card loading={api_tasks.isPending} size="small" className="">
                                    <Empty description="Không có tác vụ đang kiểm tra" />
                                 </Card>
                                 <Skeleton
                                    paragraph={false}
                                    active={api_tasks.isPending}
                                    loading={api_tasks.isPending}
                                 />
                              </>
                           ) : (
                              tasks.checking.map((item, index) => (
                                 <>
                                    <Card
                                       loading={api_tasks.isPending}
                                       key={item.id}
                                       size="small"
                                       className={cn(
                                          "border-default-500 bg-default-50 cursor-pointer border-r-4 transition-all hover:border-primary-300 hover:bg-primary-50",
                                          index === 0 ? "rounded-tl-none" : "mt-1",
                                       )}
                                       classNames={{
                                          body: "pb-2",
                                       }}
                                       onClick={() => handleOpenInner({
                                          taskId: item.id
                                       })}
                                    >
                                       <div className="flex flex-col">
                                          <section>
                                             <h3 className="text-base font-medium">{item.name}</h3>
                                          </section>
                                          <section className="mt-1 flex w-full items-center justify-between text-neutral-500">
                                             <span className="flex items-center gap-1">
                                                <EnvironmentFilled className="text-xs" />
                                                {item.device.area.name}
                                             </span>
                                             <span>{item.totalTime} phút</span>
                                          </section>
                                          {!dayjs(item.fixerDate).add(7, "hours").isSame(dayjs(), "day") && (
                                             <section className="mt-1 text-right">
                                                <span className="text-xs text-neutral-500">
                                                   {dayjs(item.fixerDate).add(7, "hours").format("DD/MM/YY")}
                                                </span>
                                             </section>
                                          )}
                                       </div>
                                    </Card>
                                    <Skeleton
                                       paragraph={false}
                                       active={api_tasks.isPending}
                                       loading={api_tasks.isPending}
                                    />
                                 </>
                              ))
                           )}
                        </div>
                     )}
                  </TaskDetailsDrawer>
               )}
            </div>
         )}
      </TaskDetailsDrawer>
   )
}
