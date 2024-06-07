"use client"

import HeadStaffRootHeader from "@/app/head-staff/_components/HeadStaffRootHeader"
import { SearchBar } from "antd-mobile"
import { Card, Collapse, Tag } from "antd"
import ReportCard from "@/app/head-staff/(navbar)/reports/_components/ReportCard"
import { IssueRequestMock } from "@/lib/mock/issue-request.mock"
import dayjs from "dayjs"
import { useMemo, useRef, useState } from "react"
import { IssueRequestDto } from "@/common/dto/IssueRequest.dto"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { mockQuery } from "@/common/util/mock-query.util"

type GroupType = {
   today: IssueRequestDto[]
   yesterday: IssueRequestDto[]
   thisWeekRemaining: IssueRequestDto[]
   lastWeek: IssueRequestDto[]
   earlier: IssueRequestDto[]
}

export default function ReportsPage() {
   const [searchInput, setSearchInput] = useState("")
   const [searchResults, setSearchResults] = useState<IssueRequestDto[] | undefined>(undefined)
   const timeoutRef = useRef<NodeJS.Timeout>(null)

   const results = useQuery({
      queryKey: qk.issueRequests.all(),
      queryFn: () => mockQuery(IssueRequestMock),
   })

   function handleSearchInputChange(value: string) {
      setSearchInput(value)
      clearTimeout(timeoutRef.current ?? undefined)

      if (value === "") {
         setSearchResults(undefined)
         return
      }

      // @ts-ignore
      timeoutRef.current = setTimeout(() => {
         setSearchResults(
            IssueRequestMock.filter((req) => req.device.machineModel.name.toLowerCase().includes(value.toLowerCase())),
         )
      }, 500)
   }

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

      results.data.forEach((req) => {
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
      <div className="overflow-y-auto">
         <HeadStaffRootHeader
            title="Reports"
            style={{
               padding: "16px",
            }}
         />
         <div className="mt-6">
            <SearchBar
               placeholder="Search by Device Name"
               showCancelButton={true}
               style={{
                  padding: "16px",
               }}
               value={searchInput}
               onChange={handleSearchInputChange}
               onCancel={() => setSearchResults(undefined)}
            />
            {searchResults ? (
               <div className="mt-2">
                  <div className="px-4">{searchResults.length} Report(s) found</div>
                  <div className="mt-2 grid grid-cols-1 gap-3 px-4">
                     {searchResults.map((result) => (
                        <ReportCard key={result.id} issueRequest={result} />
                     ))}
                  </div>
               </div>
            ) : (
               <Card
                  className="mt-2"
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
                     className="mt-3"
                     defaultActiveKey="today"
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
            )}
         </div>
      </div>
   )
}
