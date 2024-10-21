"use client"

import { App, Button, Divider, Drawer, DrawerProps, Image, Tag } from "antd"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { clientEnv } from "@/env"
import AlertCard from "@/components/AlertCard"
import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils/cn.util"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import { CheckCircle, CircleDashed, Clock, Dot, MinusCircle, XCircle } from "@phosphor-icons/react"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import Issue_CreateDetailsDrawer, {
   CreateSingleIssueDrawerRefType,
} from "@/features/head-maintenance/components/overlays/Issue_CreateDetails.drawer"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"

type Task_VerifyComplete_IssueFailedDrawerProps = {
   task?: TaskDto
   onSubmit?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   Task_VerifyComplete_IssueFailedDrawerProps & {
      handleClose?: () => void
   }

function Task_VerifyComplete_IssueFailedDrawer(props: Props) {
   const control_issueCreateDetailsDrawer = useRef<CreateSingleIssueDrawerRefType | null>(null)
   const { modal } = App.useApp()

   const mutate_updateIssues = head_maintenance_mutations.issue.updateMany()
   const mutate_replaceMany = head_maintenance_mutations.issueSparePart.replaceMany()

   const [currentTask, setCurrentTask] = useState<TaskDto | undefined>(props.task)
   const [hasUpdatedIssues, setHasUpdatedIssues] = useState<boolean>(false)

   async function handleSubmit() {
      if (!issues || !props.task) return
      await mutate_updateIssues.mutateAsync({
         issues: issues.map((issue) => ({
            id: issue.id,
            payload: {
               description: issue.description,
               fixType: issue.fixType,
               status: issue.status === IssueStatusEnum.CANCELLED ? IssueStatusEnum.CANCELLED : IssueStatusEnum.PENDING,
               ...(issue.status === IssueStatusEnum.FAILED
                  ? {
                       task: null,
                    }
                  : {}),
            },
         })),
      })
      const oldIssues = props.task.issues.flatMap((i) => i.issueSpareParts).map((i) => i.id)
      await mutate_replaceMany.mutateAsync({
         issues: issues,
         oldIssueIds: oldIssues,
      })
      props.onSubmit?.()
      props.handleClose?.()
   }

   const issues = useMemo(() => {
      return currentTask?.issues.filter(
         (issue) => issue.status === IssueStatusEnum.FAILED || issue.status === IssueStatusEnum.CANCELLED,
      )
   }, [currentTask?.issues])

   useEffect(() => {
      setCurrentTask(props.task)
   }, [props.task])

   return (
      <>
         <Drawer
            title="Kiểm tra chữ ký"
            height="max-content"
            placement="bottom"
            footer={
               <Button
                  size="large"
                  block
                  type="primary"
                  onClick={() => {
                     if (hasUpdatedIssues) {
                        modal.confirm({
                           title: "Thông báo",
                           content: "Bạn có chắc chắn muốn hoàn tất tác vụ này không?",
                           onOk: handleSubmit,
                           okText: "Có",
                           cancelText: "Đóng",
                           type: "info",
                           closable: true,
                           centered: true,
                           maskClosable: true,
                        })
                     } else {
                        modal.confirm({
                           title: "Lưu ý",
                           content:
                              "Bạn chưa cập nhật thông tin các lỗi thất bại. Bạn có chắc chắn muốn tiếp tục không?",
                           onOk: handleSubmit,
                           okText: "Tiếp tục",
                           cancelText: "Đóng",
                           okButtonProps: {
                              danger: true,
                           },
                           centered: true,
                           type: "warn",
                           closable: true,
                           maskClosable: true,
                        })
                     }
                  }}
               >
                  Xác nhận thông tin
               </Button>
            }
            classNames={{ footer: "p-layout" }}
            {...props}
         >
            <section className="mb-3">
               <AlertCard text="Vui lòng cập nhật thông tin các lỗi sau" type="info" />
               <div className="mt-6">
                  {issues?.map((issue, index, array) => (
                     <Fragment key={issue.id}>
                        {index !== 0 && (
                           <div className="grid grid-cols-[24px_1fr] gap-4">
                              {(array[index - 1] === undefined || array[index - 1]?.status === issue.status) && (
                                 <div></div>
                              )}
                              <Divider
                                 className={cn(
                                    "my-3",
                                    array[index - 1] !== undefined &&
                                       array[index - 1]?.status !== issue.status &&
                                       "col-span-2",
                                 )}
                              />
                           </div>
                        )}
                        <div className="grid cursor-pointer grid-cols-[24px_1fr] gap-4">
                           <div
                              onClick={() =>
                                 props.task &&
                                 control_issueCreateDetailsDrawer.current?.handleOpen({
                                    defaultIssue: issue,
                                    device: props.task.device,
                                    typeError: issue.typeError,
                                 })
                              }
                           >
                              {issue.status === IssueStatusEnum.PENDING && (
                                 <MinusCircle
                                    size={24}
                                    weight="fill"
                                    className={IssueStatusEnumTagMapper[issue.status].className}
                                 />
                              )}
                              {issue.status === IssueStatusEnum.RESOLVED && (
                                 <CheckCircle
                                    size={24}
                                    weight="fill"
                                    className={IssueStatusEnumTagMapper[issue.status].className}
                                 />
                              )}
                              {issue.status === IssueStatusEnum.FAILED && (
                                 <XCircle
                                    size={24}
                                    weight="fill"
                                    className={IssueStatusEnumTagMapper[issue.status].className}
                                 />
                              )}
                              {issue.status === IssueStatusEnum.CANCELLED && (
                                 <CircleDashed
                                    size={24}
                                    weight="fill"
                                    className={IssueStatusEnumTagMapper[issue.status].className}
                                 />
                              )}
                           </div>
                           <div
                              className="flex flex-col gap-1"
                              onClick={() =>
                                 props.task &&
                                 control_issueCreateDetailsDrawer.current?.handleOpen({
                                    defaultIssue: issue,
                                    device: props.task.device,
                                    typeError: issue.typeError,
                                 })
                              }
                           >
                              <header className="flex items-center justify-between gap-3">
                                 <h4>{issue.typeError.name}</h4>
                                 {issue.status === IssueStatusEnum.CANCELLED && (
                                    <Tag color={IssueStatusEnumTagMapper[issue.status].color}>
                                       {IssueStatusEnumTagMapper[issue.status].text}
                                    </Tag>
                                 )}
                              </header>
                              <div className="flex text-neutral-500">
                                 <div className={cn("flex gap-1", FixTypeTagMapper[issue.fixType].className)}>
                                    {FixTypeTagMapper[issue.fixType].icon}
                                    {FixTypeTagMapper[issue.fixType].text}
                                 </div>
                                 <Dot size={24} />
                                 <div className="flex items-center gap-1">
                                    <Clock size={16} />
                                    {issue.typeError.duration} phút
                                 </div>
                              </div>
                           </div>
                        </div>
                     </Fragment>
                  ))}
               </div>
            </section>
            <Divider />
            <section>
               <AlertCard text="Vui lòng kiểm tra chữ ký bên dưới" type="info" />
               <div className="mt-3 grid grid-cols-2 gap-3">
                  {props.task?.imagesVerify.map((img) => (
                     <Image
                        key={img}
                        src={clientEnv.BACKEND_URL + `/file-image/${props.task?.imagesVerify[0]}`}
                        alt="Chữ ký"
                        className="aspect-square h-max rounded-lg"
                     />
                  ))}
               </div>
            </section>
         </Drawer>
         <Issue_CreateDetailsDrawer
            showCancel
            onFinish={(result) => {
               setHasUpdatedIssues(true)
               setCurrentTask((prev) => {
                  if (prev) {
                     return {
                        ...prev,
                        issues: prev.issues.map((issue) => {
                           if (issue.id === result.id) {
                              return {
                                 ...issue,
                                 issueSpareParts: result.issueSpareParts,
                                 fixType: result.fixType,
                                 description: result.description,
                                 ...(result.status ? { status: result.status } : {}),
                              }
                           }
                           return issue
                        }),
                     }
                  }
                  return prev
               })
            }}
            ref={control_issueCreateDetailsDrawer}
         />
      </>
   )
}

export default Task_VerifyComplete_IssueFailedDrawer
export type { Task_VerifyComplete_IssueFailedDrawerProps }
