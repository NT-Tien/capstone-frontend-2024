"use client"

import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_All from "@/app/staff/_api/task/all.api"
import TaskCard from "@/app/staff/_components/TaskCard"
import TaskDetailsDrawer from "@/app/staff/_components/TaskDetails.drawer"
import ColumnChart from "@/common/components/ChartComponent"
import HomeHeader from "@/common/components/HomeHeader"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { ArrowUpOutlined } from "@ant-design/icons"
import { ProCard, StatisticCard } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import { Col, Row, Typography } from "antd"
import dayjs from "dayjs"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import CountUp from "react-countup"

export default dynamic(() => Promise.resolve(StaffDashboard), {
   ssr: false,
})

function StaffDashboard() {
   const response = useQuery({
      queryKey: staff_qk.task.all(),
      queryFn: Staff_Task_All,
   })

   const ongoingtask = useMemo(() => {
      if (!response.isSuccess) return
      const result = response.data?.filter((task) => task.status === TaskStatus.IN_PROGRESS)
      if (result.length > 0) return result[0]
      return null
   }, [response.data, response.isSuccess])

   const tasksToday = useMemo(() => {
      if (!response.isSuccess) return []
      return response.data?.filter((task: TaskDto) => dayjs(task.fixerDate).isSame(dayjs(), "day"))
   }, [response.data, response.isSuccess])

   return (
      <div>
         <div style={{ backgroundImage: "linear-gradient(to right, #579A0D, #1C6014)" }}>
            <div className="std-layout">
               <HomeHeader className="pb-8 pt-4" />
            </div>
         </div>
         <div className="std-layout">
            {ongoingtask && (
               <section className="mb-8 mt-5 flex space-x-4">
                  <TaskDetailsDrawer>
                     {(handleOpen) => (
                        <TaskCard
                           className="h-full w-full flex-1 shadow-fb"
                           title="Tác vụ đang thực hiện"
                           description={ongoingtask?.name ?? ""}
                           priority={ongoingtask?.priority ?? false}
                           onClick={() => handleOpen(ongoingtask?.id ?? "", true)}
                        />
                     )}
                  </TaskDetailsDrawer>
               </section>
            )}
            <section className="grid grid-cols-2 gap-4">
               <StatisticCard
                  className="relative flex h-40 w-full items-center justify-center rounded-[2rem] bg-gradient-to-b from-[#FEFEFE] via-[#F5F7EC] to-[#D3E2A1] p-4 text-center shadow-fb"
                  loading={response.isLoading}
                  bodyStyle={{
                     padding: "1rem",
                  }}
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Tổng cộng</Row>
                        <Row className="flex items-center">
                           <div className="text-3xl font-bold">
                              <CountUp end={response.data?.length ?? 0} separator={","} />
                           </div>
                        </Row>
                     </Col>
                  </div>
               </StatisticCard>
               <StatisticCard
                  className="flex h-40 w-full items-center justify-center rounded-[2rem] p-4 text-center shadow-fb"
                  bodyStyle={{
                     padding: "1rem",
                  }}
                  loading={response.isLoading}
                  style={{
                     backgroundImage: "linear-gradient(135deg, #F7F9EB 40%, #E5EFCA 60%, #D9E6B1 80%, #D6E3AB)",
                  }}
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Cần làm</Row>
                        <Row className="text-3xl font-bold">
                           <CountUp
                              end={
                                 response.data?.filter((value: TaskDto) => value.status === TaskStatus.ASSIGNED)
                                    .length ?? 0
                              }
                              separator={","}
                           />
                        </Row>
                     </Col>
                  </div>
               </StatisticCard>
               <StatisticCard
                  className="flex h-40 w-full items-center justify-center rounded-[2rem] p-4 text-center shadow-fb"
                  loading={response.isLoading}
                  bodyStyle={{
                     padding: "1rem",
                  }}
                  style={{
                     backgroundImage: "linear-gradient(-135deg, #FEFEFE, #F5F7EC, #D7E4AC, #D3E2A1)",
                  }}
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Hoàn tất</Row>
                        <Row className="text-3xl font-bold">
                           <CountUp
                              end={
                                 response.data?.filter((value: TaskDto) => value.status === TaskStatus.COMPLETED)
                                    .length ?? 0
                              }
                              separator={","}
                           />
                        </Row>
                     </Col>
                  </div>
               </StatisticCard>
               <StatisticCard
                  className="flex h-40 w-full items-center justify-center rounded-[2rem] p-4 text-center shadow-fb"
                  loading={response.isLoading}
                  bodyStyle={{
                     padding: "1rem",
                  }}
                  style={{
                     backgroundImage: "linear-gradient(to bottom, #D3E2A1, #D7E4AC, #F5F7EC, #FEFEFE)",
                  }}
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Chờ xét duyệt</Row>
                        <Row className="text-3xl font-bold">
                           <CountUp
                              end={
                                 response.data?.filter((value: TaskDto) => value.status === TaskStatus.HEAD_STAFF_CONFIRM)
                                    .length ?? 0
                              }
                              separator={","}
                           />
                        </Row>
                     </Col>
                  </div>
               </StatisticCard>
            </section>
            <section className="mt-8">
               <ProCard
                  style={{
                     maxWidth: "100%",
                     borderRadius: "2rem",
                     position: "relative",
                     overflow: "hidden",
                  }}
                  boxShadow
               >
                  <Row style={{ display: "flex", justifyContent: "center" }}>
                     <Typography.Text className="text-2xl font-medium">Báo cáo hàng tuần</Typography.Text>
                  </Row>
                  <Row>
                     <Col
                        style={{
                           position: "relative",
                           height: "250px",
                           width: "250px",
                           bottom: "0",
                           left: "0",
                           display: "flex",
                           alignItems: "flex-end",
                        }}
                     >
                        <ColumnChart />
                     </Col>
                     <Col style={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                        <Typography.Text className="text-3xl font-medium" style={{ color: '#008B1A' }}>
                        <ArrowUpOutlined />
                           65%
                        </Typography.Text>
                     </Col>
                  </Row>
               </ProCard>
            </section>
         </div>
      </div>
   )
}
