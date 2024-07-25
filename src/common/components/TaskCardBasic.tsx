import { Tag } from "antd"
import { TaskDto } from "@/common/dto/Task.dto"
import dayjs from "dayjs"
import { CalendarOutlined, ClockCircleOutlined, ExclamationCircleFilled, UserOutlined } from "@ant-design/icons"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import { CheckFat, Wrench, X } from "@phosphor-icons/react"
import { cn } from "@/common/util/cn.util"

type Props = {
   task: TaskDto
   onClick?: () => void
}

export default function TaskCardBasic(props: Props) {
   function TaskStatusColor(status: TaskStatus) {
      switch (status) {
         case TaskStatus.AWAITING_FIXER:
         case TaskStatus.AWAITING_SPARE_SPART:
         case TaskStatus.ASSIGNED:
            return "bg-transparent"
         case TaskStatus.IN_PROGRESS:
            return "bg-blue-500 border-blue-500"
         case TaskStatus.COMPLETED:
            return "bg-green-500 border-green-500"
         case TaskStatus.CANCELLED:
            return "bg-red-500 border-red-500"
      }
   }

   function TaskStatusIcon({ status }: { status: TaskStatus }) {
      switch (status) {
         case TaskStatus.AWAITING_FIXER:
         case TaskStatus.AWAITING_SPARE_SPART:
         case TaskStatus.ASSIGNED:
            return null
         case TaskStatus.IN_PROGRESS:
            return <Wrench size={12} color="white" weight="fill" />
         case TaskStatus.COMPLETED:
            return <CheckFat size={12} color="white" weight="fill" />
         case TaskStatus.CANCELLED:
            return <X size={15} color="white" weight="bold" />
      }
   }

   const status = props.task.status
   const fixerDate = props.task.fixerDate
   const priority = props.task.priority

   return (
      <div
         className="flex cursor-pointer gap-2 rounded-lg py-2 transition-all hover:bg-primary-50"
         onClick={props.onClick}
      >
         <section>
            <div
               className={cn(
                  "mt-0.5 grid h-5 w-5 place-content-center rounded-full border-2 border-neutral-300",
                  TaskStatusColor(status),
               )}
            >
               <TaskStatusIcon status={status} />
            </div>
         </section>
         <section className="flex w-full flex-col">
            <div className="flex items-start justify-between">
               <h4 className="line-clamp-2 text-base">{props.task.name}</h4>
               {priority && (
                  <Tag color="red" className="m-0">
                     <ExclamationCircleFilled className="mr-1.5" />
                     Ưu tiên
                  </Tag>
               )}
            </div>
            <div className="mt-2 flex items-center gap-1">
               <Tag className="m-0" color={TaskStatusTagMapper[status].colorInverse}>
                  {TaskStatusTagMapper[status].text}
               </Tag>
               <Tag className="m-0 flex items-center gap-1">
                  <CalendarOutlined />
                  {dayjs(fixerDate).isSame(dayjs(), "day")
                     ? "Today"
                     : dayjs(fixerDate).add(7, "hours").format("DD/MM/YY")}
               </Tag>
               <Tag className="m-0 flex items-center gap-1">
                  <ClockCircleOutlined />
                  {props.task.totalTime} phút
               </Tag>
               <Tag className="m-0 flex items-center gap-1">
                  <UserOutlined /> {props.task.fixer.username}
               </Tag>
            </div>
         </section>
      </div>
   )
}
