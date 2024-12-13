import hm_uris from "@/features/head-maintenance/uri"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequest_StatusData } from "@/lib/domain/Request/RequestStatus.mapper"
import { cn } from "@/lib/utils/cn.util"
import { Button, Drawer, Segmented, Space } from "antd"
import { DrawerProps } from "antd/lib"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import {
   CalendarOutlined,
   CheckOutlined,
   CheckSquareOutlined,
   CloseOutlined,
   ExclamationCircleOutlined,
   FileOutlined,
   MinusOutlined,
   QuestionOutlined,
   UserDeleteOutlined,
   UserOutlined,
} from "@ant-design/icons"
import { useState } from "react"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { ClockClockwise } from "@phosphor-icons/react"

type Request_PreviewDrawerProps = {
   request?: RequestDto
   returnToRequest?: string
}
type Props = Omit<DrawerProps, "children"> & Request_PreviewDrawerProps

function Request_PreviewDrawer(props: Props) {
   const router = useRouter()

   const api_request = head_maintenance_queries.request.one(
      {
         id: props.request?.id ?? "",
      },
      {
         enabled: !!props.request?.id,
      },
   )

   return (
      <Drawer
         placement="bottom"
         height="80%"
         closeIcon={false}
         title={
            <div className="flex flex-col items-center">
               <div className="h-1 w-1/2 rounded-lg bg-neutral-300" onClick={props.onClose} />
               <h1 className="mt-2 text-base font-semibold text-neutral-800">Thông tin yêu cầu</h1>
               <Space>
                  <p className="mt-1 text-xs font-light text-neutral-500">Mã số: {props.request?.code}</p>
                  <p
                     className={cn(
                        "mt-1 text-xs font-light text-neutral-500",
                        FixRequest_StatusData(props.request?.status.toLowerCase() as any)?.className,
                     )}
                  >
                     {FixRequest_StatusData(props.request?.status.toLowerCase() as any)?.text}
                  </p>
               </Space>
            </div>
         }
         footer={
            <Button
               block
               type="primary"
               onClick={() =>
                  props.request &&
                  router.push(
                     hm_uris.custom.request_id_redirecter(props.request.id, props.request, {
                        "prev-request": props.returnToRequest,
                     }),
                  )
               }
            >
               Xem chi tiết
            </Button>
         }
         classNames={{ wrapper: "rounded-t-xl", header: "border-none", footer: "p-layout", body: "pt-0" }}
         {...props}
      >
         <div className="flex flex-col gap-0.5 text-sm">
            <div className="flex gap-0.5">
               <div className="flex flex-grow items-center gap-2 rounded-tl-lg bg-neutral-100 p-2">
                  <UserOutlined /> {props.request?.requester.username}
               </div>
               <div className="flex items-center gap-2 rounded-tr-lg bg-neutral-100 p-2">
                  <CalendarOutlined />
                  {dayjs(props.request?.createdAt).format("DD/MM/YYYY")}
               </div>
            </div>
            <div className="flex gap-2 rounded-b-lg bg-neutral-100 p-2">
               <div className="flex-shrink-0">
                  <FileOutlined />
               </div>
               <div>
                  <h3 className="flex items-center gap-2">{props.request?.requester_note.split(":")[0]}</h3>
                  <p className="mt-1 text-xs font-light">{props.request?.requester_note.split(":")[1]}</p>
               </div>
            </div>
         </div>
         {api_request.isSuccess && (
            <>
               <div className="mt-3 rounded-lg bg-neutral-100 p-2">
                  <header className="flex gap-2">
                     <div className="flex-shrink-0">
                        <ExclamationCircleOutlined />
                     </div>
                     <div className="mt-0.5">
                        <h3 className="text-sm font-semibold">Danh sách Bước/Lỗi máy</h3>
                        <p className="text-xs text-neutral-500">Các lỗi/bước được thực hiện trong yêu cầu</p>
                     </div>
                  </header>
                  <main className="mt-3 flex flex-col gap-3">
                     {api_request.data?.issues?.map((issue) => (
                        <div key={issue.id} className="flex gap-2">
                           <div className="flex-shrink-0">
                              {issue.status === IssueStatusEnum.PENDING && (
                                 <div className="grid size-4 place-items-center rounded-full bg-neutral-300 text-[12px] text-white"></div>
                              )}
                              {issue.status === IssueStatusEnum.RESOLVED && (
                                 <div className="grid size-4 place-items-center rounded-full bg-green-300 text-[12px] text-white">
                                    <CheckOutlined />
                                 </div>
                              )}
                              {issue.status === IssueStatusEnum.FAILED && (
                                 <div className="grid size-4 place-items-center rounded-full bg-red-300 text-[12px] text-white">
                                    <CloseOutlined />
                                 </div>
                              )}
                              {issue.status === IssueStatusEnum.CANCELLED && (
                                 <div className="grid size-4 place-items-center rounded-full bg-purple-300 text-[12px] text-white">
                                    <MinusOutlined />
                                 </div>
                              )}
                           </div>
                           <div className="mt-0 text-sm">
                              <h1 className="font-medium leading-none">{issue.typeError.name}</h1>
                              <p className="mt-1 text-xs font-light">{issue.typeError.description}</p>
                           </div>
                        </div>
                     ))}
                  </main>
               </div>
               <div className="mt-3 rounded-lg bg-neutral-100 p-2">
                  <header className="flex gap-2">
                     <div className="flex-shrink-0">
                        <CheckSquareOutlined />
                     </div>
                     <div className="mt-0.5">
                        <h3 className="text-sm">Danh sách Tác vụ</h3>
                        <p className="text-xs text-neutral-500">Các lỗi/bước được thực hiện trong yêu cầu</p>
                     </div>
                  </header>
                  <main className="mt-3 flex flex-col gap-3">
                     {api_request.data?.tasks?.map((task) => (
                        <div key={task.id} className="flex gap-2">
                           <div className="flex-shrink-0">
                              {task.status === TaskStatus.ASSIGNED && (
                                 <div className="grid size-4 place-items-center rounded-full bg-neutral-300 text-[12px] text-white"></div>
                              )}
                              {task.status === TaskStatus.IN_PROGRESS && (
                                 <div className="grid size-4 place-items-center rounded-full bg-blue-300 text-[12px] text-white">
                                    <ClockClockwise />
                                 </div>
                              )}
                              {task.status === TaskStatus.AWAITING_FIXER && (
                                 <div className="grid size-4 place-items-center rounded-full bg-amber-500 text-[12px] text-white">
                                    <UserDeleteOutlined />
                                 </div>
                              )}
                              {task.status === TaskStatus.COMPLETED && (
                                 <div className="grid size-4 place-items-center rounded-full bg-green-300 text-[12px] text-white">
                                    <CheckOutlined />
                                 </div>
                              )}
                              {task.status === TaskStatus.HEAD_STAFF_CONFIRM && (
                                 <div className="grid size-4 place-items-center rounded-full bg-red-500 text-[12px] text-white">
                                    <QuestionOutlined />
                                 </div>
                              )}
                              {task.status === TaskStatus.CANCELLED && (
                                 <div className="grid size-4 place-items-center rounded-full bg-neutral-700 text-[12px] text-white">
                                    <QuestionOutlined />
                                 </div>
                              )}
                           </div>
                           <div>
                              <h3 className="text-sm leading-none">{task.name}</h3>
                              <div className="mt-1 flex gap-4 text-neutral-500">
                                 {task.fixer && (
                                    <p className="flex items-center gap-1 text-xs">
                                       <UserOutlined />
                                       {task.fixer.username}
                                    </p>
                                 )}
                                 {task.fixerDate && (
                                    <p className="flex items-center gap-1 text-xs">
                                       <CalendarOutlined />
                                       {dayjs(task.fixerDate).format("DD/MM/YYYY")}
                                    </p>
                                 )}
                              </div>
                           </div>
                        </div>
                     ))}
                  </main>
               </div>
            </>
         )}
      </Drawer>
   )
}

export default Request_PreviewDrawer
export type { Request_PreviewDrawerProps }
