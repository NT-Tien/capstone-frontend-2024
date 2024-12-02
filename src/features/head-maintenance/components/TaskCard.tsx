import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { Calendar, Circle, User } from "@phosphor-icons/react"
import {
   LoadingOutlined,
   CheckOutlined,
   EditOutlined,
   MoreOutlined,
   RightOutlined,
   LeftCircleFilled,
} from "@ant-design/icons"
import { Button, Dropdown, Steps } from "antd"
import { cn } from "@/lib/utils/cn.util"
import dayjs from "dayjs"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { Issue_ViewDetails_WarrantyDrawerProps } from "@/features/head-maintenance/components/overlays/warranty/Issue_ViewDetails_Warranty.drawer"
import { Task_AssignFixerModalProps } from "@/features/head-maintenance/components/overlays/Task_AssignFixerV2.drawer"

function TaskCard() {
   return <div></div>
}

type TaskCardSendWarrantyProps = {
   task: TaskDto
   handleOpen_assignFixer: (props: Task_AssignFixerModalProps) => void
   handleOpen_issueViewDetailsWarranty: (props: Issue_ViewDetails_WarrantyDrawerProps) => void
   requestId: string
   title: string
}

function TaskCardWarranty(props: TaskCardSendWarrantyProps) {
   const firstIssue = TaskUtil.getTask_Warranty_FirstIssue(props.task)
   const secondIssue = TaskUtil.getTask_Warranty_SecondIssue(props.task)

   return (
      <div
         className={cn(
            "rounded-lg p-2",
            props.task.status === TaskStatus.ASSIGNED && "bg-neutral-100",
            props.task.status === TaskStatus.IN_PROGRESS && "bg-blue-100",
            props.task.status === TaskStatus.COMPLETED && "bg-green-100",
         )}
      >
         <div className="flex gap-3">
            <div className="flex-shrink-0">
               {props.task.status === TaskStatus.ASSIGNED && (
                  <Circle size={38} weight="fill" className="text-neutral-500" />
               )}
               {props.task.status === TaskStatus.IN_PROGRESS && (
                  <div className="grid size-[38px] place-items-center rounded-full bg-blue-500 text-xl text-white">
                     <LoadingOutlined />
                  </div>
               )}
               {props.task.status === TaskStatus.COMPLETED && (
                  <div className="grid size-[38px] place-items-center rounded-full bg-green-500 text-xl text-white">
                     <CheckOutlined />
                  </div>
               )}
            </div>
            <div className="w-full pr-2">
               <div className={"flex w-full items-center"}>
                  <div className={"mr-auto text-base font-bold"}>{props.title}</div>
                  <Dropdown
                     autoFocus
                     menu={{
                        items: [
                           {
                              label: "Cập nhật",
                              icon: <EditOutlined />,
                              key: "edit-send-warranty",
                              className: cn("hidden", props.task.status === TaskStatus.ASSIGNED && "flex"),
                              onClick: () => {
                                 props.handleOpen_assignFixer({
                                    taskId: props.task.id,
                                    defaults: {
                                       date: props.task?.fixerDate ? new Date(props.task.fixerDate) : undefined,
                                       priority: props.task?.priority ? "priority" : "normal",
                                       fixer: props.task?.fixer,
                                    },
                                    recommendedFixerIds: [props.task.fixer?.id],
                                 })
                              },
                           },
                        ],
                     }}
                  >
                     <Button className="translate-x-2" size="small" type="text" icon={<MoreOutlined />} />
                  </Dropdown>
               </div>
               <div className={"flex flex-col text-xs"}>
                  <div className="text-neutral-500">{props.task.name}</div>
               </div>
            </div>
         </div>
         {props.task.status !== TaskStatus.AWAITING_FIXER && (
            <div
               className={
                  "mt-3 flex w-full justify-between gap-2 overflow-y-auto rounded-lg bg-white px-2 py-1 text-sm"
               }
            >
               <div
                  className={cn(
                     "flex items-center gap-1 whitespace-pre",
                     TaskStatusTagMapper[props.task.status].className,
                  )}
               >
                  {TaskStatusTagMapper[props.task.status].icon}
                  {TaskStatusTagMapper[props.task.status].text}
               </div>
               {props.task.fixer && (
                  <div className={cn("flex items-center gap-1")}>
                     <User size={16} weight={"duotone"} />
                     {props.task.fixer.username}
                  </div>
               )}
               {props.task.fixerDate && (
                  <div className={cn("flex items-center gap-1")}>
                     <Calendar size={16} weight={"duotone"} />
                     {dayjs(props.task.fixerDate).format("DD/MM/YYYY")}
                  </div>
               )}
            </div>
         )}
         <Steps
            className="steps-title-w-full mt-3 px-2"
            progressDot
            prefixCls="steps-inner"
            status="wait"
            size="small"
            items={[firstIssue, secondIssue].map((i) => ({
               title: (
                  <div className="flex justify-between">
                     <div className="text-sm font-semibold">{i?.typeError.name}</div>
                     <RightOutlined className="translate-x-3 text-xs" />
                  </div>
               ),
               icon: <LeftCircleFilled />,
               description: <div className="text-xs">{i?.typeError.description}</div>,
               status: (function () {
                  switch (i?.status) {
                     case IssueStatusEnum.RESOLVED:
                        return "finish"
                     case IssueStatusEnum.FAILED:
                     case IssueStatusEnum.CANCELLED:
                        return "error"
                     default:
                        return "wait"
                  }
               })(),
               onClick: () =>
                  props.handleOpen_issueViewDetailsWarranty({
                     issueId: i?.id,
                     requestId: props.requestId,
                  }),
            }))}
         />
      </div>
   )
}

TaskCardWarranty.SendTitle = "Gửi máy đi bảo hành"
TaskCardWarranty.ReceiveTitle = "Nhận máy và lắp đặt"

TaskCard.Warranty = TaskCardWarranty
export default TaskCard
