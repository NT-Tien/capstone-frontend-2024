import { Card, Progress, Tag } from "antd"
import { TaskDto } from "@/common/dto/Task.dto"
import dayjs from "dayjs"
import { CalendarOutlined, ClockCircleOutlined, ExclamationCircleFilled, UserOutlined } from "@ant-design/icons"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import { cn } from "@/common/util/cn.util"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"
import { taskPercentCalculator } from "../util/taskPercentCalculator.util"

type Props = {
   task: TaskDto
   onClick?: () => void
   highlighted?: boolean
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

   const status = props.task.status
   const fixerDate = props.task.fixerDate
   const priority = props.task.priority

   return (
      <Card
         size={"small"}
         onClick={props.onClick}
         hoverable
         className={cn(
            props.task.priority && "border-red-300 bg-red-50",
            props.highlighted && "border-2 border-primary-600 bg-primary-100 border-l-primary-500 border-l-8 text-primary-600",
         )}
      >
         <section className="flex w-full flex-col">
            <div className="flex items-start justify-between">
               <h4 className="line-clamp-2 text-sm font-medium">{props.task.name}</h4>
               {priority && (
                  <Tag color="red" className="m-0">
                     <ExclamationCircleFilled className="mr-1.5" />
                     Ưu tiên
                  </Tag>
               )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
               <Tag className="m-0" color={TaskStatusTagMapper[status]?.color ?? "default"}>
                  {TaskStatusTagMapper[status]?.text ?? "-"}
               </Tag>
               {fixerDate && (
                  <Tag className="m-0 flex items-center gap-1">
                     <CalendarOutlined />
                     {dayjs(fixerDate).isSame(dayjs(), "day")
                        ? "Hôm nay"
                        : dayjs(fixerDate).add(7, "hours").format("DD/MM/YY")}
                  </Tag>
               )}
               <Tag className="m-0 flex items-center gap-1">
                  <ClockCircleOutlined />
                  {props.task.totalTime} phút
               </Tag>
               {props.task.fixer && (
                  <Tag className="m-0 flex items-center gap-1">
                     <UserOutlined /> {props.task.fixer.username}
                  </Tag>
               )}
            </div>
            {new Set([TaskStatus.IN_PROGRESS, TaskStatus.ASSIGNED]).has(status) && (
               <div className="mt-4">
                  <Progress percent={taskPercentCalculator(props.task)} />
               </div>
            )}
         </section>
      </Card>
   )
}
