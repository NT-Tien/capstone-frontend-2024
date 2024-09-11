"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, Col, Row, Table, Typography } from "antd"
import Admin_Devices_OneByAreaId from "../_api/devices/one-byAreaId.api"
import { CheckSquareOffset, Devices, Gear, Note } from "@phosphor-icons/react"
import { admin_qk } from "../_api/qk"
import CountUp from "react-countup"

const areaIds = [
   "13734c3c-5f3b-472e-805f-557c1f08eeb2",
   "4727b5ec-87a9-4aec-9aef-c56f06258426",
   "6b2e4394-239d-437e-b5a5-62be14dea23e",
   "7be024ff-39bb-4ae1-b9a0-996a71e2e966",
   "3d78678d-1f25-4df7-8a84-6640a7692456",
]

const columns = [
   {
      title: "Khu vực",
      dataIndex: "areaNames",
      key: "areaNames",
   },
   {
      title: "Yêu cầu",
      dataIndex: "totalRequests",
      key: "totalRequests",
   },
   {
      title: "Tác vụ",
      dataIndex: "totalTasks",
      key: "totalTasks",
   },
   {
      title: "Thiết bị",
      dataIndex: "totalDevices",
      key: "totalDevices",
   },
]

export default function AdminHomePage() {
   const { data, isLoading } = useQuery({
      queryKey: ["areaData"],
      queryFn: async () => {
         const promises = areaIds.map((id) => Admin_Devices_OneByAreaId({ id }))
         return Promise.all(promises)
      },
   })

   const tableData = data?.map((areaData, index) => ({
      key: areaIds[index],
      areaNames: `Q${index + 1}`,
      totalRequests: areaData?.total_requests || 0,
      totalTasks: areaData?.total_tasks || 0,
      totalDevices: areaData?.total_devices || 0,
   }))

   const totalTasks = tableData?.reduce((acc, area) => acc + (area.totalTasks || 0), 0)
   const totalRequests = tableData?.reduce((acc, area) => acc + (area.totalRequests || 0), 0)
   return (
      <div className="mt-5">
         <div className="grid grid-cols-2 gap-12">
            <Card
               loading={isLoading}
               className={`bourder-neutral-300 mt-5 flex h-24 items-center justify-between rounded-lg border-2 p-0 text-center shadow-md`}
               classNames={{
                  body: "w-full",
               }}
            >
               <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-start">
                     <div className="text-xl">Tổng cộng</div>
                     <div className="flex items-center">
                        <CountUp className="flex align-bottom text-3xl font-bold" end={totalRequests as number} separator={","}></CountUp>
                        <Typography.Text className="ml-2 flex items-end text-base">yêu cầu</Typography.Text>
                     </div>
                  </div>
                  <div className="flex items-center">
                     <Note size={45} weight="duotone" color="text-primary-500" />
                  </div>
               </div>
            </Card>
            <Card
               loading={isLoading}
               className={`bourder-neutral-300 mt-5 flex h-24 items-center justify-between rounded-lg border-2 p-0 text-center shadow-md`}
               classNames={{
                  body: "w-full",
               }}
            >
               <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-start">
                     <div className="text-xl">Tổng cộng</div>
                     <div className="flex items-center">
                     <CountUp className="flex align-bottom text-3xl font-bold" end={totalTasks as number} separator={","}></CountUp>
                     <Typography.Text className="ml-2 flex items-end text-base">tác vụ</Typography.Text>
                     </div>
                  </div>
                  <div className="flex items-center">
                     <CheckSquareOffset size={45} weight="duotone" />
                  </div>
               </div>
            </Card>
         </div>
         <div
            style={{
               borderRadius: "12px",
               overflow: "hidden",
               boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
               marginTop: "2rem"
            }}
         >
            <Table
               columns={columns}
               dataSource={tableData}
               loading={isLoading}
               pagination={false}
               style={{
                  borderRadius: "12px",
               }}
               components={{
                  table: (props: any) => (
                     <table
                        {...props}
                        style={{
                           borderRadius: "12px",
                           overflow: "hidden",
                           width: "100%",
                        }}
                     />
                  ),
                  header: {
                     wrapper: (props: any) => (
                        <thead
                           {...props}
                           style={{
                              borderTopLeftRadius: "12px",
                              borderTopRightRadius: "12px",
                           }}
                        />
                     ),
                  },
                  body: {
                     wrapper: (props: any) => (
                        <tbody
                           {...props}
                           style={{
                              borderBottomLeftRadius: "12px",
                              borderBottomRightRadius: "12px",
                           }}
                        />
                     ),
                  },
               }}
            />
         </div>
      </div>
   )
}
