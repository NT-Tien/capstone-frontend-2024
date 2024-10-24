"use client"

import staff_qk from "@/features/staff/api/qk"
import Staff_Task_All from "@/features/staff/api/task/all.api"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { useQuery } from "@tanstack/react-query"
import { Button, Space } from "antd"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useMemo, useRef } from "react"
import CountUp from "react-countup"
import TaskDetailsDrawer, {
   TaskDetailsDrawerRefType,
} from "../../../../features/staff/components/overlays/TaskDetails.drawer"
import StaffNavigationDrawer from "@/features/staff/components/layout/StaffNavigationDrawer"
import { FilterOutlined, MenuOutlined, CompassFilled, CheckSquareOutlined, RightOutlined } from "@ant-design/icons"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import { CheckSquare } from "@phosphor-icons/react"
import ClickableArea from "@/components/ClickableArea"
import staff_uri from "@/features/staff/uri"
import hm_uris from "@/features/head-maintenance/uri"

function Page() {
   const response = useQuery({
      queryKey: staff_qk.task.all(),
      queryFn: Staff_Task_All,
   })
   const navDrawer = StaffNavigationDrawer.useDrawer()
   const router = useRouter()

   const taskDetailsDrawerRef = useRef<TaskDetailsDrawerRefType | null>(null)

   const counts = useMemo(() => {
      const counts: {
         [key in TaskStatus]: number
      } = {
         [TaskStatus.ASSIGNED]: 0,
         [TaskStatus.CANCELLED]: 0,
         [TaskStatus.COMPLETED]: 0,
         [TaskStatus.HEAD_STAFF_CONFIRM]: 0,
         [TaskStatus.AWAITING_FIXER]: 0,
         [TaskStatus.AWAITING_SPARE_SPART]: 0,
         [TaskStatus.IN_PROGRESS]: 0,
      }
      response.data?.forEach((task) => {
         counts[task.status] += 1
      })
      return counts
   }, [response.data])
   const ongoingtask = useMemo(() => {
      if (!response.isSuccess) return
      const result = response.data?.filter((task) => task.status === TaskStatus.IN_PROGRESS)
      if (result.length > 0) return result[0]
      return null
   }, [response.data, response.isSuccess])

   return (
      <div className="relative">
         <div className="absolute left-0 top-0 h-56 w-full bg-staff" />
         <PageHeaderV2
            prevButton={<PageHeaderV2.MenuButton onClick={navDrawer.handleOpen} />}
            title={"Trang chủ"}
            type="light"
            nextButton={<Button icon={<FilterOutlined className="text-white" />} type="text" />}
         />
         <section className={"relative z-50 mb-3 px-layout"}>
            <ClickableArea
               className={"flex w-full justify-start rounded-lg bg-white p-2 text-black"}
               onClick={() => {
                  if (ongoingtask) {
                     router.push(staff_uri.stack.tasks_id(ongoingtask.id))
                  } else {
                     router.push(staff_uri.navbar.tasks)
                  }
               }}
            >
               <div>
                  <CheckSquare size={48} />
               </div>
               <div className={"flex w-full flex-col items-start"}>
                  <h2 className={"text-base font-semibold text-black"}>
                     {ongoingtask ? "Tác vụ đang thực hiện" : "Chọn tác vụ để bắt đầu"}
                  </h2>
                  <div className={"w-11/12 truncate text-left text-xs"}>
                     {ongoingtask ? ongoingtask.name : "Vui lòng bắt đầu một tác vụ trong danh sách"}
                  </div>
               </div>
            </ClickableArea>
         </section>
         <main className="px-layout">
            <article className="w-full text-black">
               <Space.Compact className="w-full">
                  <Button
                     block
                     className="grid h-max place-items-center gap-0 rounded-none rounded-tl-lg py-4 text-base"
                  >
                     <div>{counts.ASSIGNED}</div>
                     <div>Chưa thực hiện</div>
                  </Button>
                  <Button
                     block
                     className="grid h-max place-items-center gap-0 rounded-none rounded-tr-lg py-4 text-base"
                  >
                     <div>{counts.COMPLETED}</div>
                     <div>Hoàn thành</div>
                  </Button>
               </Space.Compact>
               <Space.Compact direction="vertical" className="w-full">
                  <Button block className="flex justify-between rounded-none py-5 text-sm">
                     <div>Chờ đánh giá</div>
                     <div>{counts.HEAD_STAFF_CONFIRM}</div>
                  </Button>
                  <Button block className="flex justify-between rounded-none rounded-b-lg py-5 text-sm">
                     <div>Đã hủy</div>
                     <div>{counts.CANCELLED}</div>
                  </Button>
               </Space.Compact>
            </article>
            <div></div>
            <TaskDetailsDrawer ref={taskDetailsDrawerRef} />
         </main>
      </div>
   )
}

export default Page
