import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { cn } from "@/lib/utils/cn.util"
import { Tag } from "antd"
import dayjs from "dayjs"

type Props = {
   task: TaskDto
   onClick?: () => void
}

function TaskCard(props: Props) {
   return (
      <div
         className={cn(
            "rounded-md border-2 border-neutral-200 bg-white p-2",
            props.task.priority === true && "border-2 border-red-300 bg-red-100",
            props.onClick && "cursor-pointer",
         )}
         onClick={props.onClick}
      >
         <div className="flex w-full justify-between gap-2">
            <h3 className="line-clamp-2 w-full text-base font-medium">{props.task.name}</h3>
            <div>{props.task.priority === true && <Tag color="red">Ưu tiên</Tag>}</div>
         </div>
         <p className="text-neutral-500">
            Cần <span>{props.task.issues?.map((issue) => issue.issueSpareParts).length} linh kiện</span>
         </p>
         <footer className="flex justify-between">
            <div></div>
            <div className="text-xs text-neutral-600">
               {dayjs(props.task.createdAt).add(7, "hours").format("DD/MM/YYYY")}
            </div>
         </footer>
      </div>
   )
}

export default TaskCard
