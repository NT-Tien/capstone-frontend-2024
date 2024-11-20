"use client"

import CustomCalendar from "@/components/CustomCalendar"
import EmptyState from "@/components/EmptyState"
import SelectMonthYearDrawer, { SelectMonthYearDrawerProps } from "@/components/overlays/SelectMonthYear.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { UserDto } from "@/lib/domain/User/User.dto"
import { cn } from "@/lib/utils/cn.util"
import {
   CheckOutlined,
   CloseOutlined,
   DownOutlined,
   EditOutlined,
   ExclamationCircleFilled,
   MoreOutlined,
} from "@ant-design/icons"
import { CheckSquare } from "@phosphor-icons/react/dist/ssr"
import { Avatar, Button, Divider, Drawer, DrawerProps, List, Space, Switch, Tag } from "antd"
import dayjs from "dayjs"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"

type RenderListType = {
   user: UserDto
   normalTasks: {
      pending: TaskDto[]
   }
   isRecommended?: boolean
}

type Task_AssignFixerV2DrawerProps = {
   taskId?: string
   recommendedFixerIds?: string[]
   defaults?: {
      fixer?: UserDto
      date?: Date
      priority?: "normal" | "priority"
   }
   onSubmit?: (fixer: UserDto, date: Date, priority: boolean, taskId?: string) => void
   disabledAssignProps?: {
      label: string
      icon: ReactNode
      disabledContent?: ReactNode
      enabledContent?: ReactNode
      defaultEnabled?: boolean
   }
}

type Props = Omit<DrawerProps, "children"> &
   Task_AssignFixerV2DrawerProps & {
      handleClose?: () => void
   }

function Task_AssignFixerV2Drawer(props: Props) {
   const minDate = dayjs().toDate()
   const maxDate = dayjs().add(5, "years").toDate()

   const [disabledAssign, setDisabledAssign] = useState(false)

   const [selectedDate, setSelectedDate] = useState<Date | undefined>()
   const [selectedUser, setSelectedUser] = useState<UserDto | undefined>()
   const [selectedPriority, setSelectedPriority] = useState<boolean>(false)
   const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month())
   const [selectedYear, setSelectedYear] = useState<number>(dayjs().year())

   const control_selectMonthYearDrawer = useRef<RefType<SelectMonthYearDrawerProps>>(null)
   const selectFixerRef = useRef<HTMLDivElement>(null)

   const api_users = head_maintenance_queries.user.allStaff({})

   const renderList = useMemo(() => {
      if (!api_users.isSuccess) return

      let list = api_users.data

      let returnValue: RenderListType[] = list.map((user) => {
         const tasks = user.tasks.filter((task) => dayjs(task.fixerDate).isSame(selectedDate, "day"))

         return {
            user,
            normalTasks: {
               pending: tasks.filter((task) => task.status === TaskStatus.ASSIGNED),
            },
            isRecommended: props.recommendedFixerIds?.includes(user.id),
         }
      })

      returnValue = returnValue.sort((a, b) => {
         // sort by recommended
         if (a.isRecommended && !b.isRecommended) return -1
         if (!a.isRecommended && b.isRecommended) return 1

         // sort by username
         return a.user.username.localeCompare(b.user.username)
      })

      return returnValue
   }, [api_users.data, api_users.isSuccess, props.recommendedFixerIds, selectedDate])

   const highlightedDates = useMemo(() => {
      if (!api_users.isSuccess) return

      const list = api_users.data.flatMap((user) => user.tasks).filter((t) => t.status === TaskStatus.ASSIGNED)

      return list.reduce(
         (acc, curr) => {
            const date = dayjs(curr.fixerDate).format("DD/MM/YYYY")
            return {
               ...acc,
               [date]: (acc[date] ?? 0) + 1,
            }
         },
         {} as { [date: string]: number },
      )
   }, [api_users.data, api_users.isSuccess])

   function handleSubmit(
      selectedDate: Date,
      priority: boolean,
      renderList: RenderListType[],
      taskId?: string,
      selectedUser?: UserDto,
      autoAssign?: boolean,
   ) {
      let user = selectedUser
      if (autoAssign || !user) {
         // randomly select user with least pending tasks
         const sortedUsers = renderList.sort((a, b) => a.normalTasks.pending.length - b.normalTasks.pending.length)
         const firstUser = sortedUsers[0]
         const sameAsFirstUser = sortedUsers.filter(
            (u) => u.normalTasks.pending.length === firstUser.normalTasks.pending.length,
         )

         user = sameAsFirstUser[Math.floor(Math.random() * sameAsFirstUser.length)].user
      }

      if (!user) {
         console.error("No user selected")
         return
      }

      props.onSubmit?.(user, selectedDate, priority, taskId)
      props.handleClose?.()
   }

   useEffect(() => {
      if (!props.open) {
         setSelectedDate(props.defaults?.date ?? dayjs().toDate())
         setSelectedUser(props.defaults?.fixer ?? undefined)
         setSelectedPriority(props.defaults?.priority ? props.defaults.priority === "priority" : false)
      } else {
         setDisabledAssign(props.disabledAssignProps?.defaultEnabled ?? false)
      }
   }, [props.defaults?.date, props.defaults?.fixer, props.defaults?.priority, props.disabledAssignProps?.defaultEnabled, props.open])

   return (
      <>
         <Drawer
            title={false}
            closeIcon={false}
            placement="bottom"
            height="100%"
            footer={
               <Button
                  block
                  type="primary"
                  disabled={!selectedDate || (disabledAssign === false && !selectedUser)}
                  icon={<EditOutlined />}
                  loading={api_users.isLoading}
                  onClick={() => {
                     selectedDate &&
                        renderList &&
                        handleSubmit(
                           selectedDate,
                           selectedPriority,
                           renderList,
                           props.taskId,
                           selectedUser,
                           disabledAssign,
                        )
                  }}
               >
                  Cập nhật
               </Button>
            }
            classNames={{
               body: "p-0",
               footer: "p-layout",
            }}
            {...props}
         >
            <div className="bg-head_maintenance pb-4 text-white">
               <div className={"z-50 flex w-full items-center justify-between p-layout pb-0"}>
                  <Button className={"text-white"} icon={<CloseOutlined />} type={"text"} onClick={props.onClose} />
                  <h1 className={"text-lg font-semibold"}>Phân công tác vụ</h1>
                  <Button className={"text-white"} icon={<MoreOutlined />} type={"text"} />
               </div>
               <section className={"mt-2 flex justify-center"}>
                  <Button
                     type="text"
                     className="text-white"
                     onClick={() =>
                        control_selectMonthYearDrawer.current?.handleOpen({
                           defaultDate: dayjs().toDate(),
                        })
                     }
                     icon={<DownOutlined className="text-xs" />}
                     iconPosition="end"
                  >
                     Tháng {selectedMonth + 1}, {selectedYear}
                  </Button>
               </section>
               <div className="mt-3">
                  <CustomCalendar
                     disabled={{
                        before: dayjs().hour() > 15 ? dayjs().add(1, "day").toDate() : dayjs().toDate(),
                     }}
                     month={dayjs().set("month", selectedMonth).set("year", selectedYear).toDate()}
                     startMonth={minDate}
                     endMonth={maxDate}
                     className="custom-calendar-styles-hm w-full"
                     classNames={{
                        months: "w-full",
                        month_caption: "hidden",
                        dropdowns: "hidden",
                        chevron: "hidden",
                     }}
                     selected={selectedDate}
                     onDayClick={(date) => {
                        setSelectedDate(date)
                        setSelectedUser(undefined)
                     }}
                     highlightedCounts={highlightedDates}
                  />
               </div>
               <Divider className="mb-3 mt-1" />
               <div>
                  <div className="flex items-center justify-between px-layout">
                     <label htmlFor="set-priority" className="flex items-center gap-2 text-sm">
                        <ExclamationCircleFilled />
                        Ưu tiên tác vụ này?
                     </label>
                     <Switch
                        id="set-priority"
                        checked={selectedPriority}
                        onChange={setSelectedPriority}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                     />
                  </div>
                  {props.disabledAssignProps && (
                     <div className="mt-3 flex items-center justify-between px-layout">
                        <label htmlFor="set-disableAssign" className="flex items-center gap-2 text-sm">
                           {props.disabledAssignProps.icon}
                           {props.disabledAssignProps.label}
                        </label>
                        <Switch
                           id="set-disableAssign"
                           checked={disabledAssign}
                           onChange={(value) => {
                              setDisabledAssign(value)
                              setSelectedUser(undefined)
                              console.log(value)
                              if (value !== true) {
                                 selectFixerRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                    inline: "start",
                                 })
                              }
                           }}
                           checkedChildren={props.disabledAssignProps.enabledContent}
                           unCheckedChildren={props.disabledAssignProps.disabledContent}
                        />
                     </div>
                  )}
               </div>
            </div>
            <section ref={selectFixerRef}>
               {disabledAssign ? (
                  <div className="grid place-items-center p-layout">
                     <EmptyState
                        title="Tác vụ sẽ được phân công tự động"
                        description="Hệ thống sẽ tự động phân công tác vụ cho nhân viên phù hợp"
                     />
                  </div>
               ) : (
                  <>
                     <header className="mb-layout-half mt-layout px-layout">
                        <h2 className="text-base font-semibold">Chọn nhân viên</h2>
                        <p className="font-base text-sm text-neutral-500">
                           Vui lòng chọn nhân viên sẽ hoàn thành tác vụ này
                        </p>
                     </header>
                     <List
                        dataSource={renderList}
                        size="small"
                        renderItem={(item) => {
                           return (
                              <List.Item
                                 className={cn(selectedUser?.id === item.user.id && "bg-green-100", "px-layout")}
                                 onClick={() => setSelectedUser(item.user)}
                              >
                                 <List.Item.Meta
                                    avatar={
                                       selectedUser?.id === item.user.id ? (
                                          <Avatar
                                             className="bg-green-700"
                                             icon={<CheckOutlined className="text-base" />}
                                          />
                                       ) : (
                                          <Avatar>{item.user.username.at(0)}</Avatar>
                                       )
                                    }
                                    title={
                                       <div className="flex items-center justify-between">
                                          <h3>{item.user.username}</h3>
                                          {item.isRecommended && (
                                             <Tag icon={<ExclamationCircleFilled />} color="green" className="m-0">
                                                Đề xuất
                                             </Tag>
                                          )}
                                       </div>
                                    }
                                    description={
                                       <Space
                                          split={<Divider type="vertical" className="m-0" />}
                                          wrap
                                          className="text-sm"
                                       >
                                          {item.normalTasks.pending.length > 0 ? (
                                             <div className="flex items-center gap-1">
                                                <CheckSquare size={16} weight="duotone" />
                                                {item.normalTasks.pending.length} tác vụ chưa bắt đầu
                                             </div>
                                          ) : (
                                             <div>Chưa có tác vụ</div>
                                          )}
                                       </Space>
                                    }
                                 />
                              </List.Item>
                           )
                        }}
                     />
                  </>
               )}
            </section>
         </Drawer>
         <OverlayControllerWithRef ref={control_selectMonthYearDrawer}>
            <SelectMonthYearDrawer
               minDate={minDate}
               maxDate={maxDate}
               onSubmit={(month, year) => {
                  setSelectedMonth(month - 1)
                  setSelectedYear(year)
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default Task_AssignFixerV2Drawer
export type { Task_AssignFixerV2DrawerProps as Task_AssignFixerModalProps }
