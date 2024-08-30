import React, { ReactNode, useState } from "react"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { App, Button, Card, Drawer, Image, List, Tag, Typography } from "antd"
import { ProDescriptions } from "@ant-design/pro-components"
import { useMutation } from "@tanstack/react-query"
import Staff_Task_UpdateIssueStatus from "@/app/staff/_api/task/update-issue-status.api"
import staff_qk from "@/app/staff/_api/qk"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/common/enum/issue-status.enum"
import useModalControls from "@/common/hooks/useModalControls"
import { FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import FinishIssueDrawer from "@/app/staff/(stack)/tasks/[id]/start/FinishIssue.drawer"
import { clientEnv } from "@/env"

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

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} placement="bottom" height="100%" title="Chi tiết lỗi" classNames={{
            body: "overflow-y-auto"
         }}>
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
            {currentIssue?.status === IssueStatusEnum.RESOLVED &&
               (currentIssue.videosVerify || currentIssue.imagesVerify.find((img) => !!img)) && (
                  <Card size="small" className="my-layout">
                     <section>
                        <h2 className="mb-2 text-sub-base font-medium">Hình ảnh minh chứng</h2>
                        {currentIssue.imagesVerify.length === 0 ? (
                           <div className="flex items-center gap-2">
                              <Image
                                 src={clientEnv.BACKEND_URL + `/file-image/${currentIssue.imagesVerify?.[0]}`}
                                 alt="image"
                                 className="h-20 w-20 rounded-lg"
                              />
                              <div className="grid h-20 w-20 place-content-center rounded-lg border-2 border-dashed border-neutral-200"></div>
                              <div className="grid h-20 w-20 place-content-center rounded-lg border-2 border-dashed border-neutral-200"></div>
                           </div>
                        ) : (
                           <div className="grid h-20 w-full place-content-center rounded-lg bg-neutral-100">
                              Không có
                           </div>
                        )}
                     </section>
                     <section className="mt-4">
                        <h2 className="mb-2 text-sub-base font-medium">Video minh chứng</h2>
                        {!!currentIssue.videosVerify ? (
                           <video width="100%" height="240" controls>
                              <source
                                 src={clientEnv.BACKEND_URL + `/file-video/${currentIssue.videosVerify}`}
                                 type="video/mp4"
                              />
                           </video>
                        ) : (
                           <div className="grid h-20 w-full place-content-center rounded-lg bg-neutral-100">
                              Không có
                           </div>
                        )}
                     </section>
                  </Card>
               )}
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
               <section className="fixed bottom-0 left-0 w-full bg-white p-layout shadow-fb">
                  <FinishIssueDrawer
                     onFinish={() => {
                        handleClose()
                        afterSuccess?.()
                     }}
                  >
                     {(handleOpen) => (
                        <Button
                           className="w-full"
                           size="large"
                           type="primary"
                           onClick={() => {
                              console.log(currentIssue)
                              if (currentIssue) handleOpen(currentIssue.id)
                           }}
                           disabled={!scanCompleted}
                        >
                           Xác nhận hoàn thành
                        </Button>
                     )}
                  </FinishIssueDrawer>
               </section>
            )}
         </Drawer>
      </>
   )
}
