import { ReactNode, useState } from "react"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { App, Button, Drawer, List, Tag, Typography } from "antd"
import { ProDescriptions } from "@ant-design/pro-components"
import { useMutation } from "@tanstack/react-query"
import Staff_Task_UpdateIssueStatus from "@/app/staff/_api/task/update-issue-status.api"
import staff_qk from "@/app/staff/_api/qk"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"

export default function IssueDetailsDrawer({
   children,
   afterSuccess,
   scanCompleted
}: {
   children: (handleOpen: (issue: FixRequestIssueDto) => void) => ReactNode
   afterSuccess?: () => void
   scanCompleted: boolean
}) {
   const [open, setOpen] = useState(false)
   const [currentIssue, setCurrentIssue] = useState<FixRequestIssueDto | undefined>(undefined)
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

   function handleOpen(issue: FixRequestIssueDto) {
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
         <Drawer open={open} onClose={handleClose} placement="bottom" height="max-content" title="Chi tiết vấn đề">
            <ProDescriptions
               title={currentIssue?.typeError.name ?? "-"}
               extra={<Tag>{currentIssue?.status ?? "-"}</Tag>}
               dataSource={currentIssue}
               loading={currentIssue === undefined}
               size="small"
               columns={[
                  {
                     label: "Mô tả",
                     dataIndex: "description",
                  },
                  {
                     label: "Cách sửa",
                     dataIndex: "fixType",
                  },
               ]}
            />
            <div className="mt-6">
               <Typography.Title level={5}>Linh kiện thay thế ({currentIssue?.issueSpareParts.length ?? 0})</Typography.Title>
               <List
                  dataSource={currentIssue?.issueSpareParts}
                  renderItem={(item) => (
                     <List.Item className="flex justify-between">
                        <span>{item.sparePart.name}</span>
                        <span>Số lượng: {item.quantity}</span>
                     </List.Item>
                  )}
               />
            </div>
            {currentIssue?.status === IssueStatusEnum.PENDING && (
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
                  disabled={!scanCompleted}
               >
                  Xác nhận hoàn thành
               </Button>
            )}
            {currentIssue?.status === IssueStatusEnum.RESOLVED && (
               <Button
                  className="mt-6 w-full"
                  size="large"
                  type="primary"
                  danger
                  onClick={() => {
                     if (currentIssue)
                        mutate_updateStatus.mutate({
                           id: currentIssue.id,
                           status: IssueStatusEnum.PENDING,
                        })
                  }}
               >
                  Hoàn tác
               </Button>
            )}
         </Drawer>
      </>
   )
}
