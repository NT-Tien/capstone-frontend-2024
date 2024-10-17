"use client"

import { Button } from "antd"
import { FilterOutlined, MenuOutlined, CompassFilled, QrcodeOutlined } from "@ant-design/icons"
import CountUp from "react-countup"
import RequestStatisticsCard from "@/features/head-department/components/RequestStatisticsCard"
import HeadNavigationDrawer from "@/features/head-department/components/layout/HeadNavigationDrawer"
import head_department_queries from "@/features/head-department/queries"
import Link from "next/link"

function Page() {
   const navigationDrawer = HeadNavigationDrawer.useDrawer()
   const api_requests = head_department_queries.request.all({})

   return (
      <div className="relative">
         <section className="bg-head_maintenance p-layout pb-20 text-white">
            <header className="flex items-center justify-between">
               <Button
                  icon={<MenuOutlined className="text-white" />}
                  type="text"
                  onClick={navigationDrawer.handleOpen}
               />
               <h1 className="text-lg font-bold">Trang chủ</h1>
               <Button icon={<FilterOutlined className="text-white" />} type="text" />
            </header>
            <section className="my-5 flex flex-col items-center justify-center">
               <h2 className="text-base">Tổng số yêu cầu đã tạo</h2>
               <div className="mt-1 flex items-center gap-2 text-2xl">
                  <CompassFilled />
                  <CountUp end={api_requests.data?.length ?? 0} />
               </div>
            </section>
         </section>
         <main className="relative px-layout pt-[120px]">
            <RequestStatisticsCard className="absolute -top-20 left-0 px-layout" />
            <Link href="/head/scan">
               <Button className="mt-layout h-max w-full items-center justify-start rounded-lg bg-blue-500 p-3 text-white">
                  <QrcodeOutlined className="text-5xl" />
                  <div className="flex flex-col items-start">
                     <h2 className="font-semibold">Tạo yêu cầu mới</h2>
                     <div className="text-sm">Quét QR thiết bị để tạo yêu cầu sửa chữa</div>
                  </div>
               </Button>
            </Link>
         </main>
      </div>
   )
}

export default Page
