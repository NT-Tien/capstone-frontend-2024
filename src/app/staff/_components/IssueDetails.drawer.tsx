import { ReactNode, useState } from "react"
import { TaskIssueDto } from "@/common/dto/TaskIssue.dto"
import { App, Button, Drawer, List, Tag, Typography } from "antd"
import { ProDescriptions } from "@ant-design/pro-components"
import { useMutation } from "@tanstack/react-query"
import Staff_Task_UpdateIssueStatus from "@/app/staff/_api/task/update-issue-status.api"
import staff_qk from "@/app/staff/_api/qk"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"

export default function IssueDetailsDrawer({
   children,
   afterSuccess,
}: {
   children: (handleOpen: (issue: TaskIssueDto) => void) => ReactNode
   afterSuccess?: () => void
}) {
   const [open, setOpen] = useState(false)
   const [currentIssue, setCurrentIssue] = useState<TaskIssueDto | undefined>(undefined)
   const { message } = App.useApp()

   const mutate_updateStatus = useMutation({
      mutationFn: Staff_Task_UpdateIssueStatus,
      onMutate: async () => {
         message.open({
            type: "loading",
            content: `Loading...`,
            key: `loading`,
         })
      },
      onError: async (error) => {
         message.error({
            content: "An error occurred. Please try again later.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: `Issue status updated successfully.`,
         })
         handleClose()
         afterSuccess?.()
      },
      onSettled: () => {
         message.destroy(`loading`)
      },
   })

   function handleOpen(issue: TaskIssueDto) {
      setOpen(true)
      setCurrentIssue(issue)
   }

   function handleClose() {
      setOpen(false)
      setTimeout(() => {
         setCurrentIssue(undefined)
      }, 200)
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} placement="bottom" height="max-content" title="Issue Details">
            <ProDescriptions
               title={currentIssue?.typeError.name ?? "-"}
               extra={<Tag>{currentIssue?.status ?? "-"}</Tag>}
               dataSource={currentIssue}
               loading={currentIssue === undefined}
               size="small"
               columns={[
                  {
                     label: "Description",
                     dataIndex: "description",
                  },
                  {
                     label: "Fix Type",
                     dataIndex: "fixType",
                  },
               ]}
            />
            <div className="mt-6">
               <Typography.Title level={5}>Spare Parts ({currentIssue?.issueSpareParts.length ?? 0})</Typography.Title>
               <List
                  dataSource={currentIssue?.issueSpareParts}
                  renderItem={(item) => (
                     <List.Item className="flex justify-between">
                        <span>{item.sparePart.name}</span>
                        <span>Qty: {item.quantity}</span>
                     </List.Item>
                  )}
               />
            </div>
            <Button
               className="mt-6 w-full"
               size="large"
               type="primary"
               onClick={() => {
                  if (currentIssue)
                     mutate_updateStatus.mutate({
                        id: currentIssue.id,
                        status: IssueStatusEnum.RESOLVED,
                     })
               }}
            >
               Confirm Finish
            </Button>
         </Drawer>
      </>
   )
}
