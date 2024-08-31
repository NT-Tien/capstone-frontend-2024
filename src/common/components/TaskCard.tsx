import { TaskDto } from "@/common/dto/Task.dto"
import { Card, CardProps, Tag } from "antd"
import { cn } from "@/common/util/cn.util"
import {
   CalendarOutlined,
   ClockCircleOutlined,
   EnvironmentOutlined,
   ExclamationCircleFilled,
   UserOutlined,
} from "@ant-design/icons"
import dayjs from "dayjs"

type Props = {
   task: TaskDto
   cardProps?: Omit<CardProps, "onClick" | "className">
   onClick?: () => void
   className?: string
}

export default function TaskCard(props: Props) {
   const fixerDate = props.task.fixerDate

   return (
      <Card
         className={cn(
            "border-neutral-400 hover:bg-primary-50 hover:text-primary-500",
            props.task.priority && "border-l-8 border-red-500 hover:bg-red-100 hover:text-red-500",
            props.className,
         )}
         classNames={{
            body: "flex flex-col p-3",
         }}
         hoverable
         onClick={props.onClick}
         bordered
         {...props.cardProps}
      >
         <section className="flex w-full justify-between">
            <h3 className="line-clamp-2 text-base font-medium">{props.task.name}</h3>
            {props.task.priority && (
               <div>
                  <Tag color="red" className="m-0">
                     <ExclamationCircleFilled className="mr-1.5" />
                     Ưu tiên
                  </Tag>
               </div>
            )}
         </section>
         <section className="mb-1 mt-1 text-sm text-neutral-500">
            <EnvironmentOutlined className="mr-1" />
            <span>
               {props.task.device.area.name} · ({props.task.device.positionX}, {props.task.device.positionY})
            </span>
         </section>
         <section className="mt-2 flex gap-1">
            <Tag className="m-0 flex items-center gap-1">
               <CalendarOutlined />
               {dayjs(fixerDate).isSame(dayjs(), "day") ? "Today" : dayjs(fixerDate).add(7, "hours").format("DD/MM/YY")}
            </Tag>
            <Tag className="m-0 flex items-center gap-1">
               <ClockCircleOutlined />
               {props.task.totalTime} phút
            </Tag>
            <Tag className="m-0 flex items-center gap-1">
               <UserOutlined /> {props.task.fixer?.username}
            </Tag>
         </section>
      </Card>
   )
}
