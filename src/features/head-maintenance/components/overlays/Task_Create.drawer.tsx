"use client"

import headstaff_qk from "@/features/head-maintenance/qk"
import HeadStaff_Request_OneById from "@/features/head-maintenance/api/request/oneById.api"
import HeadStaff_Task_Create from "@/features/head-maintenance/api/task/create.api"
import HeadStaff_Task_UpdateAwaitSparePartToAssignFixer from "@/features/head-maintenance/api/task/update-awaitSparePartToAssignFixer.api"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import useModalControls from "@/lib/hooks/useModalControls"
import { cn } from "@/lib/utils/cn.util"
import AlertCard from "@/components/AlertCard"
import { CheckOutlined, CloseOutlined, EditOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons"
import { Clock, Wrench } from "@phosphor-icons/react"
import { useMutation, useQueries } from "@tanstack/react-query"
import {
   App,
   Button,
   Card,
   Checkbox,
   Divider,
   Drawer,
   DrawerProps,
   Input,
   Modal,
   Radio,
   Space,
   Switch,
   Tooltip,
} from "antd"
import dayjs from "dayjs"
import { useEffect, useMemo, useRef, useState } from "react"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Issue_DetailsDrawer, {
   IssueDetailsDrawerProps,
} from "@/features/head-maintenance/components/overlays/Issue_Details.drawer"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"

type CreateTaskV2DrawerProps = {
   requestId?: string
   defaultIssueIds?: string[]
   refetchFn?: () => void
}

type Props = Omit<DrawerProps, "children"> & CreateTaskV2DrawerProps

function Task_CreateDrawer(props: Props) {
   const { message, modal } = App.useApp()
   const control_issueDetailsDrawer = useRef<RefType<IssueDetailsDrawerProps>>(null)
   const editTaskNameModal = useModalControls()

   const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>(props.defaultIssueIds ?? [])
   const [taskNameGenerationType, setTaskNameGenerationType] = useState<"auto" | "manual">("auto")
   const [customTaskName, setCustomTaskName] = useState("")
   const [priority, setPriority] = useState(false)

   useEffect(() => {
      if (!props.open) {
         setSelectedIssueIds([])
         setTaskNameGenerationType("auto")
         setCustomTaskName("")
         setPriority(false)
      } else {
         setSelectedIssueIds(props.defaultIssueIds ?? [])
      }
   }, [props.open])

   console.log(selectedIssueIds, props.defaultIssueIds)

   const api = useQueries({
      queries: [
         {
            queryKey: headstaff_qk.request.byId(props.requestId ?? ""),
            queryFn: () => HeadStaff_Request_OneById({ id: props.requestId ?? "" }),
            enabled: !!props.requestId,
         },
      ],
      combine: (results) => ({
         request: results[0],
      }),
   })

   const mutations = {
      createTask: useMutation({
         mutationFn: HeadStaff_Task_Create,
      }),
      checkSparePartStock: useMutation({
         mutationFn: HeadStaff_Task_UpdateAwaitSparePartToAssignFixer,
      }),
   }

   const generatedTaskName = useMemo(() => {
      return api.request.isSuccess ? generateTaskName(api.request.data, selectedIssueIds) : ""
   }, [api.request.data, api.request.isSuccess, selectedIssueIds])

   const sortedIssues = useMemo(() => {
      return api.request.data?.issues
         .filter((i) => {
            const set = new Set([IssueStatusEnum.PENDING])
            return set.has(i.status)
         })
         .sort((a, b) => {
            if (a.task !== null && b.task === null) return 1
            if (a.task === null && b.task !== null) return -1
            return 0
         })
   }, [api.request.data?.issues])

   const totalTime = useMemo(() => {
      return api.request.data?.issues
         .filter((issue) => selectedIssueIds.includes(issue.id))
         .reduce((acc, issue) => acc + issue.typeError.duration, 0)
   }, [api.request.data?.issues, selectedIssueIds])

   function onClose(e: any) {
      function closeFn() {
         setCustomTaskName("")
         setSelectedIssueIds([])
         setPriority(false)
         setTaskNameGenerationType("auto")
         props.onClose?.(e)
      }

      if (selectedIssueIds.length > 0) {
         modal.confirm({
            centered: true,
            closable: true,
            maskClosable: true,
            title: "Lưu ý",
            content: "Bạn có chắc chắn muốn đóng mà không lưu tác vụ?",
            onOk: closeFn,
            okText: "Đóng",
            cancelText: "Hủy",
         })
         return
      } else {
         closeFn()
      }
   }

   async function handleFormSubmit() {
      if (!api.request.isSuccess || !totalTime || !sortedIssues) return

      const allIssues = new Set(sortedIssues.map((i) => i.id))
      const filteredIssueIds = selectedIssueIds.filter((i) => allIssues.has(i))

      try {
         message.destroy("loading")
         message.open({
            type: "loading",
            content: "Vui lòng chờ đợi...",
            key: "loading",
         })
         const task = await mutations.createTask.mutateAsync({
            name: taskNameGenerationType === "auto" ? generatedTaskName : customTaskName,
            priority: false,
            issueIDs: filteredIssueIds,
            totalTime: totalTime,
            request: api.request.data.id,
            operator: 0,
         })

         const updated = await mutations.checkSparePartStock.mutateAsync({ id: task.id }).catch((error) => {
            console.log(error, typeof error)
            message.destroy("info")
            if (error instanceof Error && error.message.includes("Not enough spare part")) {
               message.info({
                  content: "Không đủ linh kiện để tạo tác vụ. Tác vụ sẽ được chuyển qua trạng thái chờ linh kiện.",
                  key: "info",
               })
            } else {
               throw error
            }
         })

         message.destroy("loading")
         message.success("Tạo tác vụ thành công")
         props.onClose?.(null as any)
         props.refetchFn?.()
      } catch (error) {
         message.destroy("loading")
         message.error("Tạo tác vụ thất bại")
         console.log(error)
      }
   }

   return (
      <Drawer
         {...props}
         onClose={onClose}
         title="Tạo tác vụ"
         placement="right"
         width="100%"
         classNames={{
            footer: "p-layout",
         }}
         footer={
            <div className="flex flex-col">
               <div className="mb-layout">
                  <section className="flex flex-col gap-2 text-base">
                     <div className="flex justify-between text-sm">
                        <h5 className="block flex-grow font-medium text-gray-500">Tên tác vụ</h5>
                        <span className="mr-1 w-7/12 truncate text-right">
                           {taskNameGenerationType === "auto" ? generatedTaskName : customTaskName}
                        </span>
                        <Button
                           type="link"
                           size="small"
                           onClick={editTaskNameModal.handleOpen}
                           icon={<EditOutlined />}
                        />
                     </div>
                     <div className="flex items-center justify-between text-sm">
                        <h5 className="block flex-grow font-medium text-gray-500">Ưu tiên</h5>
                        <Switch
                           className="h-full"
                           size="small"
                           checked={priority}
                           onChange={setPriority}
                           checkedChildren={<CheckOutlined />}
                           unCheckedChildren={<CloseOutlined />}
                        />
                     </div>
                     <div className="flex justify-between text-sm">
                        <h5 className="font-medium text-gray-500">Tổng thời gian sửa</h5>
                        <p className="mt-1">{totalTime} phút</p>
                     </div>
                  </section>
               </div>
               <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  size="large"
                  disabled={selectedIssueIds.length === 0}
                  onClick={() => {
                     const hasMissingSpareParts = api.request.data?.issues
                        ?.filter((issue) => selectedIssueIds.includes(issue.id))
                        ?.some((issue) => {
                           return issue.issueSpareParts.some((isp) => isp.quantity > isp.sparePart.quantity)
                        })

                     if (!!hasMissingSpareParts) {
                        modal.confirm({
                           title: "Lưu ý",
                           content: (
                              <div>
                                 <div>
                                    Một số lỗi bạn chọn không đủ linh kiện trong kho để sửa chữa. Bạn sẽ không thể phân
                                    công tác vụ trước nếu chưa có đủ linh kiện.
                                 </div>

                                 <div className="mt-2">
                                    <strong>Bên kho sẽ được thông báo để nhập kho linh kiện.</strong>
                                 </div>
                              </div>
                           ),
                           cancelText: "Hủy",
                           okText: "Tạo tác vụ",
                           onOk: handleFormSubmit,
                           centered: true,
                           closable: true,
                           maskClosable: true,
                        })
                     } else {
                        modal.confirm({
                           title: "Xác nhận",
                           content: "Bạn có chắc chắn muốn tạo tác vụ?",
                           onOk: handleFormSubmit,
                           okText: "Tạo tác vụ",
                           cancelText: "Hủy",
                           centered: true,
                           closable: true,
                           maskClosable: true,
                        })
                     }
                  }}
                  loading={mutations.createTask.isPending || mutations.checkSparePartStock.isPending}
               >
                  Tạo tác vụ
               </Button>
            </div>
         }
      >
         <article className="mb-layout-half flex w-full items-center justify-between gap-3">
            <AlertCard
               text="Chọn các lỗi sẽ được sửa trong tác vụ"
               type="info"
               textClassName="text-sm"
               className="w-full"
            />
         </article>
         <article className="grid grid-cols-1 gap-2">
            {sortedIssues?.map((issue) => {
               const isSelected = selectedIssueIds.includes(issue.id)
               const missingSpareParts = issue.issueSpareParts.find((isp) => isp.quantity > isp.sparePart.quantity)
               return (
                  <div key={issue.id} className={cn("grid grid-cols-12", issue.task !== null && "opacity-40")}>
                     <Card
                        size="small"
                        className={cn(
                           "col-span-11 rounded-r-none border-r-0",
                           isSelected && "border-primary-300 bg-primary-100",
                           isSelected && issue.task === null && missingSpareParts && "border-yellow-300 bg-yellow-100",
                        )}
                        onClick={() => {
                           if (issue.task === null) {
                              setSelectedIssueIds((prev) => {
                                 if (prev.includes(issue.id)) {
                                    return prev.filter((id) => id !== issue.id)
                                 } else {
                                    return [...prev, issue.id]
                                 }
                              })
                           }
                        }}
                     >
                        <div className="flex items-start gap-2">
                           <Checkbox checked={selectedIssueIds.includes(issue.id)} />
                           <div className="w-full truncate text-sm font-medium leading-6">{issue.typeError.name}</div>
                        </div>
                        <Space
                           className="mt-1.5 w-full text-xs"
                           wrap
                           split={<Divider type={"vertical"} className={"m-0"} />}
                        >
                           <div
                              className={cn(
                                 "flex items-center gap-1 font-light",
                                 FixTypeTagMapper[issue.fixType].className,
                              )}
                           >
                              {FixTypeTagMapper[issue.fixType].icon}
                              {FixTypeTagMapper[issue.fixType].text}
                           </div>
                           <div className="flex flex-grow items-center gap-1 font-light">
                              <Clock />
                              {issue.typeError.duration} phút
                           </div>
                           <div className="flex flex-grow items-center gap-1 font-light">
                              <Wrench />
                              {issue.issueSpareParts.length} linh kiện
                           </div>
                        </Space>
                     </Card>
                     <Button
                        type="dashed"
                        className={cn(
                           "grid size-full place-items-center rounded-l-none p-0",
                           isSelected && "border-primary-300 bg-primary-100",
                           isSelected && issue.task === null && missingSpareParts && "border-yellow-300 bg-yellow-100",
                        )}
                        onClick={() =>
                           api.request.isSuccess &&
                           control_issueDetailsDrawer.current?.handleOpen({
                              issueId: issue.id,
                              deviceId: api.request.data.device.id,
                           })
                        }
                     >
                        {/* <RightOutlined /> */}
                        {issue.task === null && missingSpareParts ? (
                           <Tooltip title="Không đủ linh kiện">
                              <Wrench size={18} weight="fill" className="text-yellow-500" />
                           </Tooltip>
                        ) : (
                           <RightOutlined />
                        )}
                     </Button>
                  </div>
               )
            })}
         </article>

         <OverlayControllerWithRef ref={control_issueDetailsDrawer}>
            <Issue_DetailsDrawer />
         </OverlayControllerWithRef>

         <Modal
            open={editTaskNameModal.open}
            onCancel={editTaskNameModal.handleClose}
            title="Tên tác vụ"
            footer={null}
            centered
         >
            <AlertCard text="Chọn cách tạo tên tác vụ" type="info" className="mb-6 w-full" />
            <Radio.Group
               className="flex flex-col gap-2 *:w-full"
               value={taskNameGenerationType}
               onChange={(e) => setTaskNameGenerationType(e.target.value)}
            >
               <Card
                  size="small"
                  onClick={() => setTaskNameGenerationType("auto")}
                  className={cn("cursor-pointer", taskNameGenerationType === "auto" && "r-primary-500 bg-primary-50")}
               >
                  <div className="flex items-start justify-start gap-0">
                     <Radio value="auto"></Radio>
                     <div>
                        <span className="font-medium">Tạo tự động</span>
                        <p className="text-sm font-light">
                           Tên tác vụ sẽ được tạo tự động dựa trên thông tin của yêu cầu sửa chữa và số lỗi được chọn.
                        </p>
                     </div>
                  </div>
                  {taskNameGenerationType === "auto" && (
                     <Input className="mt-3" placeholder="Tên tác vụ" disabled value={generatedTaskName} />
                  )}
               </Card>
               <Card
                  size="small"
                  onClick={() => setTaskNameGenerationType("manual")}
                  className={cn(
                     "cursor-pointer",
                     taskNameGenerationType === "manual" && "border-primary-500 bg-primary-50",
                  )}
               >
                  <div className="flex items-start justify-start gap-0">
                     <Radio value="manual"></Radio>
                     <div>
                        <span className="font-medium">Tạo thủ công</span>
                        <p className="text-sm font-light">Bạn sẽ tự nhập tên tác vụ cho tác vụ mới được tạo.</p>
                     </div>
                  </div>
                  {taskNameGenerationType === "manual" && (
                     <Input
                        className="mt-3"
                        placeholder="Tên tác vụ"
                        value={customTaskName}
                        onChange={(e) => setCustomTaskName(e.target.value)}
                        autoFocus
                     />
                  )}
               </Card>
            </Radio.Group>
         </Modal>
      </Drawer>
   )
}

export function generateTaskName(data: RequestDto, selectedIssues: string[]) {
   const requestDate = dayjs(data.createdAt).format("DDMMYY")
   const area = data.device.area.name
   const machine = data.device.machineModel.name.split(" ").join("-")

   return `${requestDate}_${selectedIssues.length}_${area}_${machine}_${generateRandomText(6)}`
}

function generateRandomText(len: number) {
   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
   let result = ""
   for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
   }
   return result
}

export default Task_CreateDrawer
export type { CreateTaskV2DrawerProps }
