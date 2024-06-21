"use client"

import RootHeader from "@/common/components/RootHeader"
import { Card, Collapse, Tabs, Tag } from "antd"
import ReportCard from "@/app/head-staff/(navbar)/reports/_components/ReportCard"
import dayjs from "dayjs"
import { useMemo } from "react"
import { IssueRequestDto } from "@/common/dto/IssueRequest.dto"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import HeadStaff_Request_All30Days from "@/app/head-staff/_api/request/all30Days.api"
import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"

type GroupType = {
   today: IssueRequestDto[]
   yesterday: IssueRequestDto[]
   thisWeekRemaining: IssueRequestDto[]
   lastWeek: IssueRequestDto[]
   earlier: IssueRequestDto[]
}

export default function ReportsPage() {
   return (
      <div className="overflow-y-auto">
         <RootHeader
            title="Reports"
            style={{
               padding: "16px",
            }}
         />
         <Tabs
            type="card"
            className="mt-4 px-4"
            items={[
               {
                  key: "pending",
                  label: "Pending",
                  children: <ReportsTab status={IssueRequestStatus.PENDING} />,
               },
               {
                  key: "approved",
                  label: "Approved",
                  children: <ReportsTab status={IssueRequestStatus.APPROVED} />,
               },
               {
                  key: "rejected",
                  label: "Rejected",
                  children: <ReportsTab status={IssueRequestStatus.REJECTED} />,
               },
            ]}
         />
      </div>
   )
}

type ReportsTabProps = {
   status: IssueRequestStatus
}

function ReportsTab(props: ReportsTabProps) {
   const results = useQuery({
      queryKey: qk.issueRequests.all(1, 50, props.status),
      queryFn: () =>
         HeadStaff_Request_All30Days({
            page: 1,
            limit: 50,
            status: props.status,
         }),
   })
   const groups: GroupType = useMemo(() => {
      const base: GroupType = {
         today: [],
         yesterday: [],
         thisWeekRemaining: [],
         lastWeek: [],
         earlier: [],
      }

      if (!results.isSuccess) return base

      const today = dayjs().startOf("day")
      const yesterday = dayjs().subtract(1, "day").startOf("day")
      const thisWeek = dayjs().startOf("week")
      const lastWeek = dayjs().subtract(1, "week").startOf("week")

      results.data.list.forEach((req) => {
         const createdAt = dayjs(req.createdAt)

         if (createdAt.isSame(today, "day")) {
            base.today.push(req)
         } else if (createdAt.isSame(yesterday, "day")) {
            base.yesterday.push(req)
         } else if (createdAt.isAfter(thisWeek)) {
            base.thisWeekRemaining.push(req)
         } else if (createdAt.isAfter(lastWeek)) {
            base.lastWeek.push(req)
         } else {
            base.earlier.push(req)
         }
      })

      return base
   }, [results.data, results.isSuccess])

   return (
      <Card
         bordered={false}
         loading={results.isLoading}
         styles={{
            body: {
               padding: results.isLoading ? "16px" : 0,
            },
         }}
      >
         <Collapse
            ghost
            size="middle"
            bordered={false}
            defaultActiveKey={groups.today.length > 0 ? ["today"] : undefined}
            collapsible={groups.today.length > 0 ? undefined : "disabled"}
            items={[
               {
                  key: "today",
                  label: "Today",
                  children: (
                     <div className="grid grid-cols-1 gap-3">
                        {groups.today.map((req) => (
                           <ReportCard key={req.id} issueRequest={req} />
                        ))}
                     </div>
                  ),
                  extra: <Tag color="default">{groups.today.length} Reports</Tag>,
               },
            ]}
         />
         <Collapse
            ghost
            size="middle"
            bordered={false}
            className="mt-3"
            collapsible={groups.yesterday.length > 0 ? undefined : "disabled"}
            items={[
               {
                  key: "yesterday",
                  label: "Yesterday",
                  children: (
                     <div className="grid grid-cols-1 gap-3">
                        {groups.yesterday.map((req) => (
                           <ReportCard key={req.id} issueRequest={req} />
                        ))}
                     </div>
                  ),
                  extra: <Tag color="default">{groups.yesterday.length} Reports</Tag>,
               },
            ]}
         />
         <Collapse
            ghost
            size="middle"
            bordered={false}
            className="mt-3"
            collapsible={groups.thisWeekRemaining.length > 0 ? undefined : "disabled"}
            items={[
               {
                  key: "thisWeekRemaining",
                  label: "Remaining this Week",
                  children: (
                     <div className="grid grid-cols-1 gap-3">
                        {groups.thisWeekRemaining.map((req) => (
                           <ReportCard key={req.id} issueRequest={req} />
                        ))}
                     </div>
                  ),
                  extra: <Tag color="default">{groups.thisWeekRemaining.length} Reports</Tag>,
               },
            ]}
         />
         <Collapse
            ghost
            size="middle"
            bordered={false}
            className="mt-3"
            collapsible={groups.lastWeek.length > 0 ? undefined : "disabled"}
            items={[
               {
                  key: "lastWeek",
                  label: "Last Week",
                  children: (
                     <div className="grid grid-cols-1 gap-3">
                        {groups.lastWeek.map((req) => (
                           <ReportCard key={req.id} issueRequest={req} />
                        ))}
                     </div>
                  ),
                  extra: <Tag color="default">{groups.lastWeek.length} Reports</Tag>,
               },
            ]}
         />
         <Collapse
            ghost
            size="middle"
            bordered={false}
            className="mt-3"
            collapsible={groups.earlier.length > 0 ? undefined : "disabled"}
            items={[
               {
                  key: "earlier",
                  label: "Earlier",
                  children: (
                     <div className="grid grid-cols-1 gap-3">
                        {groups.earlier.map((req) => (
                           <ReportCard key={req.id} issueRequest={req} />
                        ))}
                     </div>
                  ),
                  extra: <Tag color="default">{groups.earlier.length} Reports</Tag>,
               },
            ]}
         />
      </Card>
   )
}
