"use client"

import CustomCalendar from "@/components/CustomCalendar"
import dayjs from "dayjs"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import StaffNavigationDrawer from "@/features/staff/components/layout/StaffNavigationDrawer"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { App, Avatar, Button, ConfigProvider, Divider, List, Space, Spin, Tabs } from "antd"
import { CalendarOutlined, DownOutlined, LoadingOutlined } from "@ant-design/icons"
import SelectYearModal, { SelectYearModalProps } from "@/components/overlays/SelectYear.modal"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import SelectMonthModal, { SelectMonthModalProps } from "@/components/overlays/SelectMonth.modal"
import staff_queries from "@/features/staff/queries"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { cn } from "@/lib/utils/cn.util"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import TaskDetailsDrawer, { TaskDetailsDrawerRefType } from "@/features/staff/components/overlays/TaskDetails.drawer"
import TaskViewDetails_FixDrawer, {
   TaskViewDetails_FixDrawerProps,
} from "@/features/staff/components/overlays/TaskViewDetails_Fix.drawer"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { Check, Clock, Hourglass, Placeholder, SealWarning } from "@phosphor-icons/react"
import { ExportStatus } from "@/lib/domain/ExportWarehouse/ExportStatus.enum"
import TaskViewDetails_WarrantyDrawer, {
   TaskViewDetails_WarrantyDrawerProps,
} from "@/features/staff/components/overlays/TaskViewDetails_Warranty.drawer"

const isCompletedSet = new Set([TaskStatus.COMPLETED, TaskStatus.CANCELLED, TaskStatus.HEAD_STAFF_CONFIRM])

function Page({ searchParams }: { searchParams: { completed?: string } }) {
   const navDrawer = StaffNavigationDrawer.useDrawer()
   const { notification } = App.useApp()

   const [selectedDate, setSelectedDate] = useState<Date>(dayjs().toDate())
   const [selectedYear, setSelectedYear] = useState<number>(dayjs().year())
   const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month())

   const control_selectYearModal = useRef<RefType<SelectYearModalProps>>(null)
   const control_selectMonthModal = useRef<RefType<SelectMonthModalProps>>(null)

   const api_tasks = staff_queries.task.allByDate({
      start_date: dayjs().set("month", selectedMonth).set("year", selectedYear).startOf("month").toISOString(),
      end_date: dayjs().set("month", selectedMonth).set("year", selectedYear).endOf("month").toISOString(),
   })

   const highlightedCounts = useMemo(() => {
      if (!api_tasks.isSuccess) return {}

      return api_tasks.data.reduce(
         (acc, curr) => {
            if (
               isCompletedSet.has(curr.status) ||
               (curr.export_warehouse_ticket?.[0] &&
                  curr.export_warehouse_ticket?.[0]?.status !== ExportStatus.ACCEPTED)
            )
               return acc

            const date = dayjs(curr.fixerDate).format("DD/MM/YYYY")
            if (acc[date]) acc[date]++
            else acc[date] = 1
            return acc
         },
         {} as { [date: string]: number },
      )
   }, [api_tasks.data, api_tasks.isSuccess])

   const highlightedDots = useMemo(() => {
      if (!api_tasks.isSuccess) return new Set<string>()

      return new Set(
         api_tasks.data
            .filter((task) => isCompletedSet.has(task.status))
            .map((task) => dayjs(task.fixerDate).format("DD/MM/YYYY")),
      )
   }, [api_tasks.data, api_tasks.isSuccess])

   const api_tasks_data = useMemo(() => {
      const returnValue: {
         [key in ListRendererTabs]: TaskDto[]
      } = {
         unfinished: [],
         finished: [],
      }

      if (!api_tasks.isSuccess) return returnValue

      api_tasks.data.forEach((task) => {
         if (task.export_warehouse_ticket.length !== 0) {
            if (
               task?.export_warehouse_ticket[0]?.status !== ExportStatus.ACCEPTED &&
               task?.export_warehouse_ticket[0]?.status !== ExportStatus.EXPORTED
            ) {
               return
            }
         }

         const fixerDate = dayjs(task.fixerDate)
         if (fixerDate.isSame(dayjs(selectedDate), "day"))
            if (isCompletedSet.has(task.status)) {
               returnValue.finished.push(task)
            } else {
               returnValue.unfinished.push(task)
            }
      })

      const finishStatusOrder = [TaskStatus.HEAD_STAFF_CONFIRM, TaskStatus.COMPLETED, TaskStatus.CANCELLED]
      returnValue.finished.sort((a, b) => {
         const statusComparison = finishStatusOrder.indexOf(a.status) - finishStatusOrder.indexOf(b.status)
         if (statusComparison !== 0) return statusComparison

         return a.name.localeCompare(b.name)
      })

      returnValue.unfinished.sort((a, b) => a.name.localeCompare(b.name))

      return returnValue
   }, [api_tasks.data, api_tasks.isSuccess, selectedDate])

   useEffect(() => {
      if (searchParams.completed) {
         notification.success({
            message: "Thành công",
            description: `Tác vụ ${searchParams.completed} đã hoàn thành thành công. Vui lòng chọn một tác vụ mới để bắt đầu`,
            key: "success",
         })
      }

      return () => {
         notification.destroy("success")
      }
   }, [notification, searchParams.completed])

   return (
      <div className={"flex min-h-screen flex-col bg-staff"}>
         <PageHeaderV2
            prevButton={<PageHeaderV2.MenuButton onClick={navDrawer.handleOpen} />}
            title={"Danh sách tác vụ"}
            nextButton={<Button type={"text"} icon={<CalendarOutlined className="text-white" />} />}
            className="pb-1"
         />
         <section className={"mt-4 flex justify-center"}>
            <Space.Compact>
               <Button
                  className={"text-white"}
                  type={"text"}
                  size={"middle"}
                  onClick={() =>
                     control_selectMonthModal.current?.handleOpen({
                        currentMonth: selectedMonth,
                     })
                  }
               >
                  Tháng {selectedMonth + 1} <DownOutlined className="text-xs" />
               </Button>
               <Button
                  className={"text-white"}
                  type={"text"}
                  size={"middle"}
                  onClick={() => control_selectYearModal.current?.handleOpen({ currentYear: selectedYear })}
               >
                  {selectedYear} <DownOutlined className="text-xs" />
               </Button>
            </Space.Compact>
         </section>
         <section className={"mb-4 grid place-items-center px-layout-half"}>
            <Suspense
               fallback={
                  <div className={"grid h-96 place-items-center"}>
                     <Spin />
                  </div>
               }
            >
               <CustomCalendar
                  mode={"single"}
                  month={dayjs().set("month", selectedMonth).set("year", selectedYear).toDate()}
                  onDayClick={(date) => setSelectedDate(date)}
                  selected={selectedDate}
                  className={"custom-calendar-styles w-full"}
                  classNames={{
                     months: "w-full",
                     month_caption: "hidden",
                     dropdowns: "hidden",
                     chevron: "hidden",
                  }}
                  highlightedCounts={highlightedCounts}
                  highlightedDots={highlightedDots}
               />
            </Suspense>
         </section>
         <ListRendererCard tasks={api_tasks_data} refetchFn={api_tasks.refetch} />
         <OverlayControllerWithRef ref={control_selectYearModal}>
            <SelectYearModal onSubmit={(year) => setSelectedYear(year)} />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_selectMonthModal}>
            <SelectMonthModal onSubmit={(month) => setSelectedMonth(month)} />
         </OverlayControllerWithRef>
      </div>
   )
}

type ListRendererProps = {
   tasks: {
      [key in ListRendererTabs]: TaskDto[]
   }
   refetchFn?: () => void
}
type ListRendererTabs = "unfinished" | "finished"

function ListRendererCard(props: ListRendererProps) {
   const [tab, setTab] = useState<ListRendererTabs>("unfinished")

   const control_taskViewDetails_fixDrawer = useRef<RefType<TaskViewDetails_FixDrawerProps>>(null)
   const control_taskViewDetails_warrantyDrawer = useRef<RefType<TaskViewDetails_WarrantyDrawerProps>>(null)

   function handleItemClick(task: TaskDto) {
      if (TaskUtil.isTask_Fix(task)) {
         control_taskViewDetails_fixDrawer.current?.handleOpen({
            taskId: task.id,
         })
         return
      }

      if (TaskUtil.isTask_Warranty(task)) {
         control_taskViewDetails_warrantyDrawer.current?.handleOpen({
            taskId: task.id,
         })
         return
      }
   }

   return (
      <>
         <article className={"h-full w-full flex-grow rounded-t-3xl bg-white shadow-fb"}>
            <ConfigProvider
               theme={{
                  token: {
                     colorPrimary: "#FF6B00",
                     colorPrimaryBorder: "#FF6B00",
                  },
               }}
            >
               <Tabs
                  className={"test-tabs"}
                  activeKey={tab}
                  onChange={(key) => setTab(key as ListRendererTabs)}
                  items={[
                     {
                        key: "unfinished",
                        label: `Chưa thực hiện (${props.tasks.unfinished.length})`,
                     },
                     {
                        key: "finished",
                        label: `Đã hoàn thành (${props.tasks.finished.length})`,
                     },
                  ]}
               />
            </ConfigProvider>
            <List
               className={"px-layout"}
               dataSource={props.tasks[tab]}
               renderItem={(item, index) => (
                  <List.Item className={cn(index === 0 && "pt-0")} onClick={() => handleItemClick(item)}>
                     <List.Item.Meta
                        avatar={
                           <Avatar
                              icon={
                                 item.status === TaskStatus.HEAD_STAFF_CONFIRM ? (
                                    <Hourglass size={18} weight={"duotone"} />
                                 ) : item.status === TaskStatus.COMPLETED ? (
                                    <Check size={22} />
                                 ) : item.status === TaskStatus.ASSIGNED ? (
                                    <Placeholder size={16} />
                                 ) : item.status === TaskStatus.IN_PROGRESS ? (
                                    <LoadingOutlined />
                                 ) : undefined
                              }
                              className={cn(
                                 item.status === TaskStatus.HEAD_STAFF_CONFIRM && "bg-orange-500",
                                 item.status === TaskStatus.COMPLETED && "bg-green-500",
                                 item.status === TaskStatus.ASSIGNED && "bg-gray-500",
                                 item.status === TaskStatus.IN_PROGRESS && "bg-blue-500",
                              )}
                           />
                        }
                        title={item.name}
                        description={
                           <Space wrap split={<Divider type={"vertical"} className={"m-0 text-sm"} />}>
                              {item.priority && <div className={"text-red-500"}>Ưu tiên</div>}
                              {item.status !== TaskStatus.ASSIGNED ? (
                                 <div className={TaskStatusTagMapper[item.status].className}>
                                    {TaskStatusTagMapper[item.status].text}
                                 </div>
                              ) : (
                                 <div className={"flex items-center gap-1"}>
                                    <Clock size={16} weight={"duotone"} />
                                    <span>{item.totalTime} Phút</span>
                                 </div>
                              )}
                              <div className={"flex items-center gap-1"}>
                                 <SealWarning size={16} weight={"duotone"} />
                                 <span>{item.issues.length} Lỗi</span>
                              </div>
                           </Space>
                        }
                     />
                  </List.Item>
               )}
            />
         </article>
         <ConfigProvider
            theme={{
               token: {
                  colorPrimary: "#FF6B00",
                  colorPrimaryBorder: "#FF6B00",
               },
            }}
         >
            <OverlayControllerWithRef ref={control_taskViewDetails_fixDrawer}>
               <TaskViewDetails_FixDrawer refetchFn={props.refetchFn} />
            </OverlayControllerWithRef>
            <OverlayControllerWithRef ref={control_taskViewDetails_warrantyDrawer}>
               <TaskViewDetails_WarrantyDrawer refetchFn={props.refetchFn} />
            </OverlayControllerWithRef>
         </ConfigProvider>
      </>
   )
}

export default Page