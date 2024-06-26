"use client"

import { Button, Card, Empty, Flex, Skeleton, Typography } from "antd"
import { ClockCircleOutline } from "antd-mobile-icons"
import React from "react"
import HomeHeader from "@/common/components/HomeHeader"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { PlusOutlined, RightOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import { IssueRequestStatusTag } from "@/common/enum/issue-request-status.enum"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Head_Request_All from "@/app/head/_api/request/all.api"

export default function HeadDashboardPage() {
   const router = useRouter()
   const result = useQuery({
      queryKey: qk.issueRequests.allRaw(),
      queryFn: () => Head_Request_All(),
      select: (data) => data.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt))).slice(0, 4),
   })

   return (
      <div
         style={{
            display: "grid",
            gridTemplateColumns: "[outer-start] 16px [inner-start] 1fr [inner-end] 16px [outer-end] 0",
         }}
      >
         <HomeHeader
            className="py-4"
            style={{
               gridColumn: "inner-start / inner-end",
            }}
         />
         <div
            className="flex justify-between gap-3"
            style={{
               gridColumn: "inner-start / inner-end",
            }}
         >
            <Skeleton.Button className="aspect-square h-full w-full" />
            <Skeleton.Button className="aspect-square h-full w-full" />
            <Skeleton.Button className="aspect-square h-full w-full" />
         </div>
         <div
            className="mt-5 flex items-center justify-between"
            style={{
               gridColumn: "inner-start / inner-end",
            }}
         >
            <div className="flex items-center gap-2">
               <ClockCircleOutline />
               <Typography.Title level={5} className="mb-0">
                  Your Previous Reports
               </Typography.Title>
            </div>
            <Link href="/head/history">
               <Button type="link" className="p-0">
                  See More
               </Button>
            </Link>
         </div>
         <div
            className="mt-3 grid grid-cols-1 gap-3"
            style={{
               gridColumn: "inner-start / inner-end",
            }}
         >
            {result.isSuccess ? (
               <>
                  {result.data.length === 0 && (
                     <Card>
                        <Empty description="You have no previous reports">
                           <Link href="/head/scan">
                              <Button icon={<PlusOutlined />} type="primary">
                                 Create Report
                              </Button>
                           </Link>
                        </Empty>
                     </Card>
                  )}
                  {result.data.length > 0 &&
                     result.data.map((req) => (
                        <Card
                           key={req.id}
                           size="small"
                           title={req.device.description}
                           bordered={true}
                           hoverable
                           type="inner"
                           classNames={{
                              header: "bg-[#FEF7FF]",
                           }}
                           onClick={() => router.push(`/head/history/${req.id}`)}
                           extra={
                              <div className="flex items-center gap-1">
                                 <IssueRequestStatusTag status={req.status} />
                                 <Button type="text" size="small" ghost icon={<RightOutlined />} />
                              </div>
                           }
                        >
                           <Flex justify="space-between" align="center">
                              <Typography.Text ellipsis={true}>{req.requester_note}</Typography.Text>
                              <Typography.Text className="text-xs">
                                 {dayjs(req.createdAt).format("DD/MM/YYYY")}
                              </Typography.Text>
                           </Flex>
                        </Card>
                     ))}
               </>
            ) : (
               <>
                  {result.isLoading && <Card loading />}
                  {result.isError && <div>An error has occurred. Please try again</div>}
               </>
            )}
         </div>
      </div>
   )
}
