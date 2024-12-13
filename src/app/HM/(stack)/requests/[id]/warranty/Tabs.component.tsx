import { RefType } from "@/components/utils/OverlayControllerWithRef"
import DeviceDetails from "@/features/head-maintenance/components/DeviceDetails"
import { CreateTaskV2DrawerProps } from "@/features/head-maintenance/components/overlays/Task_Create.drawer"
import hm_uris from "@/features/head-maintenance/uri"
import { SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import RequestUtil from "@/lib/domain/Request/Request.util"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { CheckSquare, CheckSquareOffset, Devices, Truck, WarningDiamond } from "@phosphor-icons/react"
import { UseQueryResult } from "@tanstack/react-query"
import { App } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import WarrantyTab from "./Warranty.tab"
import TasksTab from "@/app/HM/(stack)/requests/[id]/warranty/Tasks.tab"
import DeviceTab from "@/app/HM/(stack)/requests/[id]/warranty/Device.tab"

type Props = {
   requestId: string
   api_request: UseQueryResult<RequestDto, Error>
   api_device: UseQueryResult<DeviceDto, Error>
   api_deviceHistory: UseQueryResult<RequestDto[], Error>
}

function TabbedLayout(props: Props) {
   const router = useRouter()
   const searchParams = useSearchParams()

   const [tab, setTab] = useState<string | undefined>()

   const control_taskCreateDrawer = useRef<RefType<CreateTaskV2DrawerProps> | null>(null)

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

      // const urlSearchParams = new URLSearchParams(searchParams.toString())
      // urlSearchParams.set("tab", value)
      // router.push(hm_uris.stack.requests_id_warranty(props.requestId) + `?${urlSearchParams.toString()}`)
   }

   useEffect(() => {
      const currentTab = searchParams.get("tab") || "tasks"
      setTab(currentTab)
   }, [searchParams])

   return (
      <>
         <nav className={cn("mt-5 grid grid-cols-3 gap-0 *:pb-3")}>
            <div
               className={cn(
                  "relative grid cursor-pointer place-items-center gap-2 text-white/30 transition-all before:absolute before:inset-x-0 before:bottom-0 before:left-1/2 before:h-1 before:w-1/2 before:-translate-x-1/2 before:rounded-t-lg before:bg-white before:opacity-0 before:transition-all before:content-['']",
                  tab === "tasks" && "before:opacity-1 text-white",
               )}
               onClick={() => handleTabChange("tasks")}
            >
               <CheckSquare size={20} weight={"duotone"} />
               <div className="text-center text-sm">Tác vụ ({props.api_request.data?.tasks.length ?? '-'})</div>
            </div>
            <div
               className={cn(
                  "relative grid cursor-pointer place-items-center gap-2 text-white/30 transition-all before:absolute before:inset-x-0 before:bottom-0 before:left-1/2 before:h-1 before:w-1/2 before:-translate-x-1/2 before:rounded-t-lg before:bg-white before:opacity-0 before:transition-all before:content-['']",
                  tab === "warranty" && "before:opacity-1 text-white",
               )}
               onClick={() => handleTabChange("warranty")}
            >
               <Truck size={20} weight={"duotone"} />
               <div className="text-center text-sm">Đơn Bảo hành</div>
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
               <TasksTab
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
            {tab === "warranty" && <WarrantyTab api_request={props.api_request} />}
            {tab === "device" && props.api_request.isSuccess && <DeviceTab api_request={props.api_request} />}
         </div>
      </>
   )
}

export default TabbedLayout
