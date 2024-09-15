import IssueDetailsDrawer from "@/app/head-staff/_components/IssueDetailsDrawer"
import DataListView from "@/components/DataListView"
import { DeviceDto } from "@/common/dto/Device.dto"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"
import { Issue_StatusData } from "@/common/dto/status/Issue.status"
import { FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { cn } from "@/common/util/cn.util"
import { PlusOutlined } from "@ant-design/icons"
import { CheckSquareOffset, Devices, MapPin, WarningDiamond } from "@phosphor-icons/react"
import { UseQueryResult } from "@tanstack/react-query"
import { Divider, Empty, Skeleton } from "antd"
import Button from "antd/es/button"
import Card from "antd/es/card"
import List from "antd/es/list"
import Result from "antd/es/result"
import Segmented from "antd/es/segmented"
import Spin from "antd/es/spin"
import Tag from "antd/es/tag"
import dayjs from "dayjs"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import CreateTaskDrawer, { CreateTaskDrawerRefType } from "./CreateTask.drawer"
import TasksListTab from "./TasksList.tab"
import DeviceRequestHistoryDrawer from "../DeviceRequestHistory.drawer"
import isApproved from "./is-approved.util"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { SendWarrantyTypeErrorId } from "@/constants/Warranty"
import { TaskStatus } from "@/common/enum/task-status.enum"
import IssuesListTab from "./IssuesList.tab"

type Props = {
   requestId: string
   api_request: UseQueryResult<FixRequestDto, Error>
   api_device: UseQueryResult<DeviceDto, Error>
   api_deviceHistory: UseQueryResult<FixRequestDto[], Error>
}

function TabbedLayout(props: Props) {
   const router = useRouter()
   const searchParams = useSearchParams()
   const [isHovered, setIsHovered] = useState(false)

   const [tab, setTab] = useState<string | undefined>()

   const createTaskRef = useRef<CreateTaskDrawerRefType | null>(null)

   const hasExpired = useMemo(() => {
      if (!props.api_device.isSuccess) return false
      return dayjs().isAfter(dayjs(props.api_device.data.machineModel?.warrantyTerm))
   }, [props.api_device.isSuccess, props.api_device.data?.machineModel?.warrantyTerm])

   const sendToWarrantyTask = useMemo(() => {
      const issue = props.api_request.data?.issues.find((issue) => issue.typeError.id === SendWarrantyTypeErrorId)
      const task = issue?.task
      return task
   }, [props.api_request.data?.issues])

   const highlightedId = useMemo(() => {
      if (!props.api_request.isSuccess || !props.api_request.data.is_warranty) return

      // TODO improve performance
      const sendToWarrantyTaskFull = props.api_request.data.tasks.find((task) => task.id === sendToWarrantyTask?.id)

      const result = []
      if (
         sendToWarrantyTaskFull &&
         (sendToWarrantyTaskFull.fixer === null || sendToWarrantyTaskFull.fixer === undefined)
      )
         result.push(sendToWarrantyTaskFull.id) // highlight if send to warranty task is not assigned

      return new Set(result)
   }, [
      props.api_request.data?.is_warranty,
      props.api_request.data?.tasks,
      props.api_request.isSuccess,
      sendToWarrantyTask?.id,
   ])

   const createTaskBtnText = useMemo(() => {
      if (!props.api_request.isSuccess) return

      // if there exists a send to warranty task that is not completed, and there are no other issues, disable
      if (
         props.api_request.data.is_warranty &&
         !!sendToWarrantyTask === true &&
         sendToWarrantyTask?.status !== TaskStatus.COMPLETED
      ) {
         return true
      }

      // if there are no more unassigned issues, disable
      if (props.api_request.data.issues.find((issue) => issue.task === null) === undefined) {
         return true
      }

      return false
   }, [
      props.api_request.data?.is_warranty,
      props.api_request.data?.issues,
      props.api_request.isSuccess,
      sendToWarrantyTask,
   ])

   function handleTabChange(value: string) {
      setTab(value)

      const urlSearchParams = new URLSearchParams(searchParams.toString())
      urlSearchParams.set("tab", value)
      router.push(`/head-staff/mobile/requests/${props.requestId}/approved?${urlSearchParams.toString()}`)
   }

   useEffect(() => {
      const currentTab = searchParams.get("tab") || "tasks"
      setTab(currentTab)
   }, [searchParams])

   return (
      <>
         <nav className="mt-5 grid grid-cols-3 gap-0 *:pb-3">
            <div
               className={cn(
                  "relative grid cursor-pointer place-items-center gap-2 text-neutral-400 transition-all before:absolute before:inset-x-0 before:bottom-0 before:left-1/2 before:h-1 before:w-1/2 before:-translate-x-1/2 before:rounded-t-lg before:bg-red-500 before:opacity-0 before:transition-all before:content-['']",
                  tab === "tasks" && "before:opacity-1 text-red-500",
               )}
               onClick={() => handleTabChange("tasks")}
            >
               <CheckSquareOffset size={20} weight={"duotone"} />
               <div className="text-center text-sm">Tác vụ</div>
            </div>
            <div
               className={cn(
                  "relative grid cursor-pointer place-items-center gap-2 text-neutral-400 transition-all before:absolute before:inset-x-0 before:bottom-0 before:left-1/2 before:h-1 before:w-1/2 before:-translate-x-1/2 before:rounded-t-lg before:bg-blue-500 before:opacity-0 before:transition-all before:content-['']",
                  tab === "issues" && "before:opacity-1 text-blue-500",
               )}
               onClick={() => handleTabChange("issues")}
            >
               <WarningDiamond size={20} weight={"duotone"} />
               <div className="text-center text-sm">Lỗi máy</div>
            </div>
            <div
               className={cn(
                  "relative grid cursor-pointer place-items-center gap-2 text-neutral-400 transition-all before:absolute before:inset-x-0 before:bottom-0 before:left-1/2 before:h-1 before:w-1/2 before:-translate-x-1/2 before:rounded-t-lg before:bg-green-500 before:opacity-0 before:transition-all before:content-['']",
                  tab === "device" && "before:opacity-1 text-green-500",
               )}
               onClick={() => handleTabChange("device")}
            >
               <Devices size={20} weight={"duotone"} />
               <div className="text-center text-sm">Thiết bị</div>
            </div>
         </nav>
         <div className="flex h-full flex-1 flex-col rounded-t-2xl border-neutral-200 bg-neutral-100">
            {tab === "tasks" && (
               <>
                  <TasksListTab api_request={props.api_request} className="flex-1" highlightTaskId={highlightedId} />

               {props.api_request.isSuccess &&
                  new Set([FixRequestStatus.APPROVED, FixRequestStatus.IN_PROGRESS]).has(
                     props.api_request.data.status,
                  ) && (
                     <section className="fixed bottom-0 left-0 w-full bg-inherit p-layout">
                        <div className="grid w-full grid-cols-3 gap-3">
                           <Button
                              className="col-span-2 w-full"
                              type="primary"
                              size="large"
                              icon={<PlusOutlined />}
                              onClick={() => createTaskRef.current?.handleOpen(props.requestId)}
                              disabled={createTaskBtnText}
                           >
                              Tạo tác vụ
                           </Button>
                           <Button
                              className="col-span-1 w-full"
                              size="large"
                              type="primary"
                           >
                              Hoàn tất
                           </Button>
                        </div>
                     </section>
                  )}
            </>
         )}
            {tab === "issues" && <IssuesListTab api_request={props.api_request} />}
            {tab === "device" && (
               <div className="mt-layout-half rounded-lg">
                  <DataListView
                     bordered
                     dataSource={props.api_device.data}
                     itemClassName="py-2"
                     labelClassName="font-normal text-neutral-400 text-[14px]"
                     valueClassName="text-[14px] font-medium"
                     items={[
                        {
                           label: "Mẫu máy",
                           value: (s) => s.machineModel?.name,
                        },
                        {
                           label: "Nhà sản xuất",
                           value: (s) => s.machineModel?.manufacturer,
                        },
                        {
                           label: "Năm sản xuất",
                           value: (s) => s.machineModel?.yearOfProduction,
                        },
                        {
                           label: "Thời hạn bảo hành",
                           value: (s) =>
                              s.machineModel?.warrantyTerm === null || s.machineModel.warrantyTerm === undefined ? (
                                 <span>Không có bảo hành</span>
                              ) : (
                                 <span className="flex flex-col">
                                    <span className="text-right">
                                       {dayjs(s.machineModel?.warrantyTerm).add(7, "days").format("DD/MM/YYYY")}
                                    </span>
                                    {hasExpired && (
                                       <Tag color="red-inverse" className="m-0">
                                          Hết bảo hành
                                       </Tag>
                                    )}
                                 </span>
                              ),
                        },
                        {
                           label: "Mô tả",
                           value: (s) => s.description,
                        },
                        {
                           isDivider: true,
                           label: "",
                           value: () => null,
                        },
                        {
                           label: "Khu vực",
                           value: (s) => s.area?.name,
                        },
                        {
                           label: "Vị trí (x, y)",
                           value: (s) => (
                              <a className="flex items-center gap-1">
                                 {s.positionX} x {s.positionY}
                                 <MapPin size={16} weight="fill" />
                              </a>
                           ),
                        },
                     ]}
                  />
                  {props.api_request.isSuccess && (
                     <section className="mt-layout px-layout">
                        {props.api_deviceHistory.isSuccess ? (
                           <>
                              <List
                                 dataSource={props.api_deviceHistory.data?.slice(0, 2)}
                                 split
                                 header={
                                    <h5 className="text-lg font-medium text-neutral-500">
                                       Lịch sử sửa chữa ({props.api_deviceHistory.data?.length ?? "-"})
                                    </h5>
                                 }
                                 renderItem={(item, index) => (
                                    <List.Item
                                       className={cn(index === 0 && "mt-1")}
                                       onClick={() => {
                                          if (isApproved(item.status)) {
                                             router.push(
                                                `/head-staff/mobile/requests/${item.id}/approved?viewingHistory=true`,
                                             )
                                          } else {
                                             router.push(`/head-staff/mobile/requests/${item.id}?viewingHistory=true`)
                                          }
                                       }}
                                       extra={
                                          <div className="flex flex-col justify-between gap-1">
                                             <div className="text-right">
                                                {item.is_warranty && <Tag color="orange">Bảo hành</Tag>}
                                                <Tag
                                                   className="mr-0"
                                                   color={FixRequest_StatusMapper(item).colorInverse}
                                                >
                                                   {FixRequest_StatusMapper(item).text}
                                                </Tag>
                                             </div>
                                             <span className="text-right text-neutral-500">
                                                {dayjs(item.updatedAt).add(7, "hours").format("DD/MM/YYYY")}
                                             </span>
                                          </div>
                                       }
                                    >
                                       <List.Item.Meta
                                          title={item.requester.username}
                                          description={<span className="line-clamp-1">{item.requester_note}</span>}
                                       ></List.Item.Meta>
                                    </List.Item>
                                 )}
                              />
                              {props.api_deviceHistory.data && props.api_deviceHistory.data?.length > 2 && (
                                 <DeviceRequestHistoryDrawer>
                                    {(handleOpen) => (
                                       <Button
                                          type="dashed"
                                          className="mb-layout w-full"
                                          size="middle"
                                          onClick={() =>
                                             props.api_device.isSuccess &&
                                             props.api_request.isSuccess &&
                                             handleOpen(props.api_device.data.id, props.api_request.data.id)
                                          }
                                       >
                                          Xem thêm
                                       </Button>
                                    )}
                                 </DeviceRequestHistoryDrawer>
                              )}
                           </>
                        ) : (
                           <>
                              {props.api_deviceHistory.isPending && (
                                 <Card className="mb-layout" size="small">
                                    <Spin>
                                       <div className="flex h-full items-center justify-center">Đang tải...</div>
                                    </Spin>
                                 </Card>
                              )}
                              {props.api_deviceHistory.isError && (
                                 <Card size="small" className="mb-layout">
                                    <Result
                                       status="error"
                                       title="Có lỗi xảy ra"
                                       subTitle="Vui lòng thử lại sau"
                                       extra={
                                          <Button onClick={() => props.api_deviceHistory.refetch()}>Thử lại</Button>
                                       }
                                    />
                                 </Card>
                              )}
                           </>
                        )}
                     </section>
                  )}
               </div>
            )}
         </div>
         <CreateTaskDrawer ref={createTaskRef} refetchFn={props.api_request.refetch} />
      </>
   )
}

export default TabbedLayout
