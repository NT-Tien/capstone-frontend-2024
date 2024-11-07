"use client"

import CustomCalendar from "@/components/CustomCalendar"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { UserDto } from "@/lib/domain/User/User.dto"
import { cn } from "@/lib/utils/cn.util"
import { CheckOutlined, CloseOutlined, ExclamationCircleFilled, MoreOutlined } from "@ant-design/icons"
import { CheckSquare } from "@phosphor-icons/react/dist/ssr"
import { Avatar, Button, Divider, Drawer, DrawerProps, List, Space, Switch } from "antd"
import dayjs from "dayjs"
import { useEffect, useMemo, useState } from "react"

type Task_AssignFixerV2DrawerProps = {
   recommendedFixerIds?: string[]
   defaults?: {
      fixer?: UserDto
      date?: Date
      priority?: "normal" | "priority"
   }
   onSubmit?: (fixer: UserDto, date: Date, priority: boolean) => void
}
type Props = Omit<DrawerProps, "children"> &
   Task_AssignFixerV2DrawerProps & {
      handleClose?: () => void
   }

function Task_AssignFixerV2Drawer(props: Props) {
   const [selectedDate, setSelectedDate] = useState<Date>(dayjs().toDate())
   const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)
   const [selectedPriority, setSelectedPriority] = useState<boolean>(false)

   const api_users = head_maintenance_queries.user.allStaff({})

   const renderList = useMemo(() => {
      if (!api_users.isSuccess) return

      const list = api_users.data.filter((user) => !props.recommendedFixerIds?.includes(user.id))

      let returnValue = list.map((user) => {
         const tasks = user.tasks.filter((task) => dayjs(task.fixerDate).isSame(selectedDate, "day"))

         return {
            user,
            normalTasks: {
               pending: tasks.filter((task) => task.status === TaskStatus.ASSIGNED),
            },
         }
      })

      returnValue = returnValue.sort((a, b) => {
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

   const recommendedFixers = useMemo(() => {
      if (!api_users.isSuccess) return undefined
      if (props.recommendedFixerIds === undefined || props.recommendedFixerIds.length === 0) return []

      const list = api_users.data.filter((user) => props.recommendedFixerIds?.includes(user.id))

      let returnValue = list.map((user) => {
         const tasks = user.tasks.filter((task) => dayjs(task.fixerDate).isSame(selectedDate, "day"))

         return {
            user,
            normalTasks: {
               pending: tasks.filter((task) => task.status === TaskStatus.ASSIGNED),
               inProgress: tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS),
               done: tasks.filter(
                  (task) => task.status === TaskStatus.COMPLETED || task.status === TaskStatus.HEAD_STAFF_CONFIRM,
               ),
            },
         }
      })

      returnValue = returnValue.sort((a, b) => {
         return a.user.username.localeCompare(b.user.username)
      })

      return returnValue
   }, [api_users.data, api_users.isSuccess, props.recommendedFixerIds, selectedDate])

   function handleSubmit(selectedUser: UserDto, selectedDate: Date, priority: boolean) {
      props.onSubmit?.(selectedUser, selectedDate, priority)
      props.handleClose?.()
   }

   useEffect(() => {
      if (!props.open) {
         setSelectedDate(dayjs().toDate())
         setSelectedUser(null)
         setSelectedPriority(false)
      }
   }, [props.open])

   useEffect(() => {
      if (props.defaults?.date) setSelectedDate(props.defaults.date)
      if (props.defaults?.fixer) setSelectedUser(props.defaults.fixer)
      if (props.defaults?.priority) setSelectedPriority(props.defaults.priority === "priority")
   }, [props.defaults?.date, props.defaults?.fixer, props.defaults?.priority])

   return (
      <Drawer
         title={
            <div>
               <div className={"flex w-full items-center justify-between"}>
                  <Button className={"text-white"} icon={<CloseOutlined />} type={"text"} onClick={props.onClose} />
                  <h1 className={"text-lg font-semibold"}>Phân công tác vụ</h1>
                  <Button className={"text-white"} icon={<MoreOutlined />} type={"text"} />
               </div>
               <div className="mt-3">
                  <CustomCalendar
                     disabled={{
                        before: dayjs().hour() > 15 ? dayjs().add(1, "day").toDate() : dayjs().toDate(),
                     }}
                     className="custom-calendar-styles-hm w-full"
                     classNames={{
                        months: "w-full",
                        chevron: "text-white",
                     }}
                     selected={selectedDate}
                     onDayClick={(date) => {
                        setSelectedDate(date)
                        setSelectedUser(null)
                     }}
                     highlightedCounts={highlightedDates}
                  />
               </div>
            </div>
         }
         closeIcon={false}
         placement="bottom"
         height="100%"
         footer={
            <Button
               block
               type="primary"
               disabled={!selectedDate || !selectedUser}
               onClick={() => selectedUser && handleSubmit(selectedUser, selectedDate, selectedPriority)}
            >
               Phân công
            </Button>
         }
         classNames={{
            body: "px-0",
            footer: "p-layout",
            header: "bg-head_maintenance text-white",
         }}
         {...props}
      >
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
         {recommendedFixers && recommendedFixers.length > 0 && (
            <>
               <Divider className="mb-2 text-sm" plain orientation="left">
                  Đề xuất nhân viên
               </Divider>
               <List
                  dataSource={recommendedFixers}
                  size="small"
                  renderItem={(item, index) => {
                     return (
                        <List.Item
                           className={cn(
                              //   index === 0 && "pt-0",
                              selectedUser?.id === item.user.id && "bg-green-100",
                              "px-layout",
                           )}
                           onClick={() => setSelectedUser(item.user)}
                        >
                           <List.Item.Meta
                              avatar={
                                 selectedUser?.id === item.user.id ? (
                                    <Avatar className="bg-green-700" icon={<CheckOutlined className="text-base" />} />
                                 ) : (
                                    <Avatar>{item.user.username.at(0)}</Avatar>
                                 )
                              }
                              title={item.user.username}
                              description={
                                 <Space split={<Divider type="vertical" className="m-0" />} wrap className="text-sm">
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
         <Divider className="my-4 mb-2 text-sm" orientation="left">
            {recommendedFixers && recommendedFixers.length > 0 ? "Hoặc chọn nhân viên khác" : "Chọn nhân viên"}
         </Divider>
         <List
            dataSource={renderList}
            size="small"
            renderItem={(item, index) => {
               return (
                  <List.Item
                     className={cn(selectedUser?.id === item.user.id && "bg-green-100", "px-layout")}
                     onClick={() => setSelectedUser(item.user)}
                  >
                     <List.Item.Meta
                        avatar={
                           selectedUser?.id === item.user.id ? (
                              <Avatar className="bg-green-700" icon={<CheckOutlined className="text-base" />} />
                           ) : (
                              <Avatar>{item.user.username.at(0)}</Avatar>
                           )
                        }
                        title={item.user.username}
                        description={
                           <Space split={<Divider type="vertical" className="m-0" />} wrap className="text-sm">
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
      </Drawer>
   )
}

export default Task_AssignFixerV2Drawer
export type { Task_AssignFixerV2DrawerProps as Task_AssignFixerModalProps }
