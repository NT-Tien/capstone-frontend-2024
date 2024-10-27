"use client"

import { Button } from "antd"
import { FilterOutlined, CompassFilled, QrcodeOutlined } from "@ant-design/icons"
import CountUp from "react-countup"
import RequestStatisticsCard from "@/features/head-department/components/RequestStatisticsCard"
import HeadNavigationDrawer from "@/features/head-department/components/layout/HeadNavigationDrawer"
import head_department_queries from "@/features/head-department/queries"
import Link from "next/link"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import HeadConfirmList from "@/features/head-department/components/HeadConfirmList"
import { useMemo } from "react"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

function Page() {
   const navigationDrawer = HeadNavigationDrawer.useDrawer()
   const api_requests = head_department_queries.request.all({})

   const renderList = useMemo(() => {
      if (!api_requests.isSuccess) return []

      let list = [...api_requests.data]
      return list
   }, [api_requests.data])

   const headConfirmRequests = useMemo(() => {
      return renderList.filter((request) => request.status === FixRequestStatus.HEAD_CONFIRM)
   }, [renderList])
   return (
      <div className="relative">
         <section className="absolute left-0 top-0 h-56 w-full bg-head_department text-white" />
         <PageHeaderV2
            prevButton={<PageHeaderV2.MenuButton onClick={navigationDrawer.handleOpen} />}
            title="Trang chủ"
            // nextButton={<Button icon={<FilterOutlined className="text-white" />} type="text" />}
         />
         <section className="relative z-50 mb-3 flex -translate-y-2 flex-col items-center justify-center text-white">
            <h2 className="text-base">Tổng số yêu cầu đã tạo</h2>
            <div className="mt-1 flex items-center gap-2 text-2xl">
               <CompassFilled />
               <CountUp end={api_requests.data?.length ?? 0} />
            </div>
         </section>
         <main className="relative px-layout">
            <RequestStatisticsCard className="" />
            <Link href="/head/scan">
               <Button className="mt-layout-half h-max w-full items-center justify-start rounded-lg bg-blue-500 p-3 text-white">
                  <QrcodeOutlined className="text-4xl" />
                  <div className="flex flex-col items-start">
                     <h2 className="font-semibold">Tạo yêu cầu mới</h2>
                     <div className="text-sm">Quét QR thiết bị để tạo yêu cầu sửa</div>
                  </div>
               </Button>
            </Link>
            <section className="mt-3">
               {headConfirmRequests.length > 0 && <HeadConfirmList requests={headConfirmRequests} />}{" "}
            </section>
         </main>
      </div>
   )
}

export default Page
