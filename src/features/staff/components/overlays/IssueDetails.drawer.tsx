import FinishIssueDrawer from "@/features/staff/components/overlays/FinishIssue.drawer"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import useModalControls from "@/lib/hooks/useModalControls"
import { ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import { clientEnv } from "@/env"
import { ProDescriptions } from "@ant-design/pro-components"
import { Button, Card, Drawer, Dropdown, Image, Input, List, Select, Tag, Typography } from "antd"
import { ReactNode, useMemo, useState } from "react"
import { MoreOutlined } from "@ant-design/icons"
import TextArea from "antd/es/input/TextArea"
import staff_mutations from "@/features/staff/mutations"
import AlertCard from "@/components/AlertCard"

export default function IssueDetailsDrawer({
   children,
   afterSuccess,
   scanCompleted,
}: {
   children: (handleOpen: (issue: IssueDto, task: TaskDto) => void) => ReactNode
   afterSuccess?: () => void
   scanCompleted: boolean
}) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         setTask(undefined)
         setTimeout(() => {
            setCurrentIssue(undefined)
         }, 200)
      },
      onOpen: (issue: IssueDto, task: TaskDto) => {
         setTask(task)
         setCurrentIssue(issue)
      },
   })

   const [task, setTask] = useState<TaskDto | undefined>(undefined)
   const [currentIssue, setCurrentIssue] = useState<IssueDto | undefined>(undefined)
   const [isErrorDrawerOpen, setIsErrorDrawerOpen] = useState(false)
   const [selectedErrorReason, setSelectedErrorReason] = useState<string | undefined>()
   const [newErrorText, setNewErrorText] = useState<string>("")

   const openErrorDrawer = () => {
      setIsErrorDrawerOpen(true)
   }

   const closeErrorDrawer = () => {
      setIsErrorDrawerOpen(false)
      setNewErrorText("")
   }

   const handleSelectChange = (value: string) => {
      setSelectedErrorReason(value)
   }

   const mutate_failIssue = staff_mutations.issues.failed()

   const handleNewErrorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setNewErrorText(e.target.value)
   }

   const isWarrantyReturnTask = useMemo(() => {
      return currentIssue?.typeError.id === ReceiveWarrantyTypeErrorId
   }, [currentIssue?.typeError.id])

   const warrantyReceipts = useMemo(() => {
      if (!isWarrantyReturnTask) return
      const targetTask = task?.request.tasks.find((task) =>
         task.issues.find((issue) => issue.typeError.id === SendWarrantyTypeErrorId),
      )

      return targetTask?.issues.find((issue) => issue.typeError.id === SendWarrantyTypeErrorId)?.imagesVerify
   }, [isWarrantyReturnTask, task?.request.tasks])

   return (
      <>
         {children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            placement="bottom"
            height="100%"
            title="Chi tiết lỗi"
            classNames={{
               body: "overflow-y-auto",
            }}
         >
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
                        {currentIssue.imagesVerify.length !== 0 ? (
                           <div className="grid grid-cols-3 gap-3">
                              {currentIssue.imagesVerify.map((img) => (
                                 <Image
                                    key={img}
                                    src={clientEnv.BACKEND_URL + `/file-image/${img}`}
                                    alt="image"
                                    className="aspect-square h-full rounded-lg"
                                 />
                              ))}
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
            {isWarrantyReturnTask && (
               <div>
                  <Typography.Title level={5}>Biên lai bảo hành</Typography.Title>
                  <div className="grid grid-cols-3 gap-3">
                     {warrantyReceipts?.map((img) => (
                        <Image
                           key={img}
                           src={clientEnv.BACKEND_URL + `/file-image/${img}`}
                           alt="image"
                           className="aspect-square h-full rounded-lg"
                        />
                     ))}
                  </div>
               </div>
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
                        <section className="std-layout-outer fixed bottom-0 left-0 flex w-full justify-center gap-3 bg-inherit p-layout">
                           <Button
                              className="w-full"
                              size="large"
                              type="primary"
                              onClick={() => {
                                 console.log(currentIssue)
                                 if (currentIssue) handleOpen(currentIssue)
                              }}
                              disabled={!scanCompleted}
                           >
                              Xác nhận hoàn thành
                           </Button>
                           <Dropdown
                              menu={{
                                 items: [
                                    {
                                       key: "failed",
                                       label: <div onClick={openErrorDrawer}>Lỗi này không thể hoàn thành</div>,
                                    },
                                    {
                                       type: "divider",
                                    },
                                 ],
                              }}
                           >
                              <Button size="large" icon={<MoreOutlined />} />
                           </Dropdown>
                        </section>
                     )}
                  </FinishIssueDrawer>
               </section>
            )}
         </Drawer>
         <Drawer
            title="Hủy lỗi"
            open={isErrorDrawerOpen}
            onClose={closeErrorDrawer}
            height={"max-content"}
            placement="bottom"
            classNames={{
               footer: "p-layout",
            }}
            footer={
               <Button
                  size="large"
                  type="primary"
                  block
                  disabled={!selectedErrorReason || !newErrorText}
                  onClick={() => {
                     mutate_failIssue.mutate(
                        {
                           id: currentIssue?.id ?? "",
                           payload: {
                              failReason: selectedErrorReason ?? newErrorText,
                           },
                        },
                        {
                           onSuccess: () => {
                              afterSuccess?.()
                              handleClose()
                           },
                        },
                     )
                     closeErrorDrawer()
                  }}
               >
                  Gửi
               </Button>
            }
         >
            <AlertCard text="Vui lòng chọn lý do hủy lỗi" type="info" className="mb-layout" />
            <Select
               size="large"
               placeholder="Chọn lý do"
               onChange={handleSelectChange}
               style={{ width: "100%" }}
               options={[
                  { label: "Thiếu linh kiện", value: "missing_parts" },
                  { label: "Chẩn đoán lỗi sai", value: "wrong_issue" },
                  { label: "Máy cần kiểm tra lại", value: "recheck" },
                  { label: "Lý do khác", value: "add_new_error" },
               ]}
            />

            <TextArea
               placeholder="Ghi chú"
               className="mt-layout-half"
               size="large"
               value={newErrorText}
               onChange={handleNewErrorChange}
               maxLength={500}
               showCount
               style={{ resize: "none", height: 120 }}
            />
         </Drawer>
      </>
   )
}
