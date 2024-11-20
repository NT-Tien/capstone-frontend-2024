import HeadStaff_Request_UpdateStatus from "@/features/head-maintenance/api/request/updateStatus.api"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import DataListView from "@/components/DataListView"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import { PlusOutlined } from "@ant-design/icons"
import { CheckSquareOffset, Devices, MapPin, WarningDiamond } from "@phosphor-icons/react"
import { useMutation, UseQueryResult } from "@tanstack/react-query"
import { App } from "antd"
import Button from "antd/es/button"
import Card from "antd/es/card"
import List from "antd/es/list"
import Result from "antd/es/result"
import Spin from "antd/es/spin"
import Tag from "antd/es/tag"
import dayjs from "dayjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import Device_ViewRequestHistoryDrawer from "@/features/head-maintenance/components/overlays/Device_ViewRequestHistory.drawer"
import IssuesListTab from "./IssuesList.tab"
import TasksListTab from "./TasksList.tab"
import Task_CreateDrawer, {
   CreateTaskV2DrawerProps,
} from "@/features/head-maintenance/components/overlays/Task_Create.drawer"
import hm_uris from "@/features/head-maintenance/uri"
import DeviceDetails from "@/features/head-maintenance/components/DeviceDetails"

type Props = {
   requestId: string
   api_request: UseQueryResult<RequestDto, Error>
   api_device: UseQueryResult<DeviceDto, Error>
   api_deviceHistory: UseQueryResult<RequestDto[], Error>
}

function TabbedLayout(props: Props) {
   const router = useRouter()
   const { message, modal } = App.useApp()
   const searchParams = useSearchParams()

   const [tab, setTab] = useState<string | undefined>()

   const control_taskCreateDrawer = useRef<RefType<CreateTaskV2DrawerProps> | null>(null)

   const mutate_finishRequest = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
      onMutate: () => {
         message.destroy("finishRequest")
         message.loading({
            content: "Đang hoàn tất yêu cầu...",
            key: "finishRequest",
         })
      },
      onSettled: () => {
         message.destroy("finishRequest")
      },
      onSuccess: () => {
         message.success({
            content: "Hoàn tất yêu cầu thành công",
         })
      },
      onError: (error) => {
         console.error(error)
         message.error({
            content: "Hoàn tất yêu cầu thất bại",
         })
      },
   })

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
      if (
         props.api_request.data.issues.find(
            (issue) => issue.task === null && issue.status === IssueStatusEnum.PENDING,
         ) === undefined
      ) {
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
      router.push(hm_uris.stack.requests_id_fix(props.requestId) + `?${urlSearchParams.toString()}`)
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
                  "relative grid cursor-pointer place-items-center gap-2 text-white/30 transition-all before:absolute before:inset-x-0 before:bottom-0 before:left-1/2 before:h-1 before:w-1/2 before:-translate-x-1/2 before:rounded-t-lg before:bg-white before:opacity-0 before:transition-all before:content-['']",
                  tab === "tasks" && "before:opacity-1 text-white",
               )}
               onClick={() => handleTabChange("tasks")}
            >
               <CheckSquareOffset size={20} weight={"duotone"} />
               <div className="text-center text-sm">Tác vụ ({props.api_request.data?.tasks.length ?? 0})</div>
            </div>
            <div
               className={cn(
                  "relative grid cursor-pointer place-items-center gap-2 text-white/30 transition-all before:absolute before:inset-x-0 before:bottom-0 before:left-1/2 before:h-1 before:w-1/2 before:-translate-x-1/2 before:rounded-t-lg before:bg-white before:opacity-0 before:transition-all before:content-['']",
                  tab === "issues" && "before:opacity-1 text-white",
               )}
               onClick={() => handleTabChange("issues")}
            >
               <WarningDiamond size={20} weight={"duotone"} />
               <div className="text-center text-sm">Lỗi máy ({props.api_request.data?.issues.length ?? 0})</div>
            </div>
            <div
               className={cn(
                  "relative grid cursor-pointer place-items-center gap-2 text-white/30 transition-all before:absolute before:inset-x-0 before:bottom-0 before:left-1/2 before:h-1 before:w-1/2 before:-translate-x-1/2 before:rounded-t-lg before:bg-white before:opacity-0 before:transition-all before:content-['']",
                  tab === "device" && "before:opacity-1 text-white",
               )}
               onClick={() => handleTabChange("device")}
            >
               <Devices size={20} weight={"duotone"} />
               <div className="text-center text-sm">Thiết bị</div>
            </div>
         </nav>
         <div className="flex h-full flex-1 flex-col rounded-t-2xl border-neutral-200 bg-white shadow-fb">
            {tab === "tasks" && (
               <TasksListTab
                  api_request={props.api_request}
                  className="flex-1"
                  highlightTaskId={highlightedId}
                  handleOpenCreateTask={() => {
                     control_taskCreateDrawer.current?.handleOpen({ requestId: props.requestId })
                  }}
                  onSuccess_FinishRequest={() => router.push(hm_uris.navbar.requests)}
                  disabledCreateTask={createTaskBtnText}
               />
            )}
            {tab === "issues" && (
               <IssuesListTab
                  api_request={props.api_request}
                  handleOpenTaskCreate={(requestId, defaultIssueIds) =>
                     control_taskCreateDrawer.current?.handleOpen({ requestId, defaultIssueIds })
                  }
               />
            )}
            {tab === "device" && props.api_request.isSuccess && (
               <DeviceDetails device={props.api_request.data.device} className="border-none p-layout" />
            )}
         </div>
         <OverlayControllerWithRef ref={control_taskCreateDrawer}>
            <Task_CreateDrawer refetchFn={props.api_request.refetch} />
         </OverlayControllerWithRef>
      </>
   )
}

export default TabbedLayout
