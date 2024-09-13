import IssueDetailsDrawer from "@/app/head-staff/_components/IssueDetailsDrawer"
import DataListView from "@/components/DataListView"
import { DeviceDto } from "@/common/dto/Device.dto"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"
import { Issue_StatusData } from "@/common/dto/status/Issue.status"
import { FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { cn } from "@/common/util/cn.util"
import { PlusOutlined } from "@ant-design/icons"
import { MapPin } from "@phosphor-icons/react"
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
import TasksList from "./TasksList.tab"
import DeviceRequestHistoryDrawer from "../DeviceRequestHistory.drawer"
import isApproved from "./is-approved.util"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { SendWarrantyTypeErrorId } from "@/constants/Warranty"
import { TaskStatus } from "@/common/enum/task-status.enum"

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

   const returnFromWarrantyTask = useMemo(() => {}, [])

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
         <Segmented
            size="large"
            block
            value={tab}
            onChange={handleTabChange}
            className="mt-6"
            options={[
               {
                  label: "Tác vụ",
                  value: "tasks",
               },
               {
                  label: "Lỗi máy",
                  value: "issues",
               },
               {
                  label: "Thiết bị",
                  value: "device",
               },
            ]}
         />
         {tab === "tasks" && (
            <>
               <>
                  {props.api_request.data?.tasks.length === 0 ? (
                     <Card size="small" className="mt-layout-half py-12">
                        <Empty description="Chưa có tác vụ nào được tạo" image={Empty.PRESENTED_IMAGE_DEFAULT} />
                     </Card>
                  ) : (
                     <TasksList
                        api_request={props.api_request}
                        className="std-layout-outer mt-2"
                        highlightTaskId={highlightedId}
                     />
                  )}
               </>

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
                              type={isHovered ? "primary" : "default"}
                              onMouseEnter={() => setIsHovered(true)}
                              onMouseLeave={() => setIsHovered(false)}
                           >
                              Hoàn tất
                           </Button>
                        </div>
                     </section>
                  )}
            </>
         )}
         {tab === "issues" && (
            <>
               {props.api_request.data?.issues.filter((issue) => issue.task === null).length !== 0 && (
                  <section className="mb-layout mt-layout rounded-lg border-2 border-neutral-100 bg-white p-layout shadow-lg">
                     <h5 className="font-semibold text-neutral-700">Lỗi chưa có tác vụ</h5>
                     <Divider className="my-1" />
                     <IssueDetailsDrawer refetch={() => {}} showActions={false}>
                        {(handleOpen) => (
                           <List
                              dataSource={props.api_request.data?.issues.filter((issue) => issue.task === null)}
                              className="mt-layout-half"
                              renderItem={(item, index) => (
                                 <List.Item
                                    className={cn(index === 0 && "pt-0")}
                                    extra={
                                       <Tag color={Issue_StatusData(item.status).color}>
                                          {Issue_StatusData(item.status).text}
                                       </Tag>
                                    }
                                    onClick={() => handleOpen(item.id, props.api_device.data?.id ?? "", false)}
                                 >
                                    <List.Item.Meta
                                       title={item.typeError.name}
                                       description={
                                          <div>
                                             <Tag color={FixTypeTagMapper[item.fixType].color}>
                                                {FixTypeTagMapper[item.fixType].text}
                                             </Tag>
                                             <div className="w-60 truncate">{item.description}</div>
                                          </div>
                                       }
                                    ></List.Item.Meta>
                                 </List.Item>
                              )}
                           />
                        )}
                     </IssueDetailsDrawer>
                  </section>
               )}
               <section>
                  <IssueDetailsDrawer refetch={() => {}} showActions={false}>
                     {(handleOpen) => (
                        <List
                           dataSource={props.api_request.data?.issues.filter((issue) => issue.task !== null)}
                           className="mt-layout-half"
                           renderItem={(item, index) => (
                              <List.Item
                                 className={cn(index === 0 && "pt-0")}
                                 extra={
                                    <Tag color={Issue_StatusData(item.status).color}>
                                       {Issue_StatusData(item.status).text}
                                    </Tag>
                                 }
                                 onClick={() => handleOpen(item.id, props.api_device.data?.id ?? "", false)}
                              >
                                 <List.Item.Meta
                                    title={item.typeError.name}
                                    description={
                                       <span>
                                          <Tag color={FixTypeTagMapper[item.fixType].color}>
                                             {FixTypeTagMapper[item.fixType].text}
                                          </Tag>
                                          <span className="truncate">{item.description}</span>
                                       </span>
                                    }
                                 ></List.Item.Meta>
                              </List.Item>
                           )}
                        />
                     )}
                  </IssueDetailsDrawer>
               </section>
            </>
         )}
         {tab === "device" && (
            <div className="mt-layout-half rounded-lg border-2 border-neutral-200">
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
                                             <Tag className="mr-0" color={FixRequest_StatusMapper(item).colorInverse}>
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
                                    extra={<Button onClick={() => props.api_deviceHistory.refetch()}>Thử lại</Button>}
                                 />
                              </Card>
                           )}
                        </>
                     )}
                  </section>
               )}
            </div>
         )}
         <CreateTaskDrawer ref={createTaskRef} refetchFn={props.api_request.refetch} />
      </>
   )
}

export default TabbedLayout
