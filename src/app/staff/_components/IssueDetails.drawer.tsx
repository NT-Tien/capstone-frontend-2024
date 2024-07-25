import { ReactNode, useState } from "react"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { App, Button, Drawer, List, Tag, Typography } from "antd"
import { ProDescriptions } from "@ant-design/pro-components"
import { useMutation } from "@tanstack/react-query"
import Staff_Task_UpdateIssueStatus from "@/app/staff/_api/task/update-issue-status.api"
import staff_qk from "@/app/staff/_api/qk"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/common/enum/issue-status.enum"
import useModalControls from "@/common/hooks/useModalControls"
import { FixTypeTagMapper } from "@/common/enum/fix-type.enum"

export default function IssueDetailsDrawer({
   children,
   afterSuccess,
   scanCompleted,
}: {
   children: (handleOpen: (issue: FixRequestIssueDto) => void) => ReactNode
   afterSuccess?: () => void
   scanCompleted: boolean
}) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         setTimeout(() => {
            setCurrentIssue(undefined)
         }, 200)
      },
      onOpen: (issue: FixRequestIssueDto) => {
         setCurrentIssue(issue)
      },
   })

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
            content: "Đã xảy ra lỗi khi cập nhật trạng thái vấn đề.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: `Cập nhật trạng thái vấn đề thành công.`,
         })
         handleClose()
         afterSuccess?.()
      },
      onSettled: () => {
         message.destroy(`loading`)
      },
   })

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} placement="bottom" height="max-content" title="Chi tiết vấn đề">
            <ProDescriptions
               title={currentIssue?.typeError.name ?? "-"}
               extra={
                  currentIssue && (
                     <Tag color={IssueStatusEnumTagMapper[String(currentIssue.status)].colorInverse}>
                        {IssueStatusEnumTagMapper[String(currentIssue.status)].text}
                     </Tag>
                  )
               }
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
                     render: (_, e) => (
                        <Tag color={FixTypeTagMapper[e.fixType].colorInverse}>{FixTypeTagMapper[e.fixType].text}</Tag>
                     ),
                  },
               ]}
            />
            <div className="mt-6">
               <Typography.Title level={5}>
                  Linh kiện thay thế ({currentIssue?.issueSpareParts.length ?? 0})
               </Typography.Title>
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
