"use client"

import { stockkeeper_qk } from "@/app/stockkeeper/_api/qk"
import Stockkeeper_Task_All from "@/app/stockkeeper/_api/task/getAll.api"
import RootHeader from "@/components/layout/RootHeader"
import { LeftOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, Empty, Input, Result, Skeleton, Tabs } from "antd"
import { FilterOutlined } from "@ant-design/icons"
import TaskCard from "@/app/stockkeeper/_components/TaskCard"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { useMemo, useRef, useState } from "react"
import SortDrawer, { SortDrawerRefType } from "./Sort.drawer"
import { Sort } from "./Sort"
import dayjs from "dayjs"
import { ArrowDown, ArrowUp, Square } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import ScrollableTabs from "@/components/ScrollableTabs"
import { TaskDto } from "@/lib/domain/Task/Task.dto"

function Page({ searchParams }: { searchParams: { tab?: string } }) {
   const router = useRouter()

   const api_tasks = useQuery({
      queryKey: stockkeeper_qk.tasks.all({ page: 1, limit: 1000 }),
      queryFn: () => Stockkeeper_Task_All({ page: 1, limit: 1000 }),
      select: (data) => {
         const filtered = data.list.filter((item) => item.status === TaskStatus.AWAITING_SPARE_SPART)
         return {
            list: filtered,
            total: filtered.length,
         }
      },
   })

   const [sort, setSort] = useState<Sort>({ type: "createdAt", order: "asc" })
   const [tab, setTab] = useState(searchParams.tab ?? "missing")
   const sortDrawerRef = useRef<SortDrawerRefType | null>(null)

   function handleTabChange(key: string) {
      setTab(key)
      router.push("/stockkeeper/mobile/tasks?tab=" + key)
   }

   const tasksByCategory = useMemo(() => {
      const tasks = api_tasks.data?.list
      const missing = tasks?.filter(
         (task) =>
            !!task.issues.find((issue) => !!issue.issueSpareParts.find((sp) => sp.quantity > sp.sparePart.quantity)),
      )
      const done = tasks?.filter((task) =>
         task.issues.every((issue) => issue.issueSpareParts.every((sp) => sp.quantity <= sp.sparePart.quantity)),
      )

      return {
         missing: sortTasks(missing || [], sort),
         done: sortTasks(done || [], sort),
      }
   }, [api_tasks.data?.list, sort])

   return (
      <main className="std-layout">
         <RootHeader
            title="Tác vụ"
            className="std-layout-outer p-4"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
         />
         <ScrollableTabs
            className="std-layout-outer sticky left-0 top-0 z-50"
            classNames={{
               content: "mt-layout",
            }}
            tab={tab}
            onTabChange={handleTabChange}
            items={[
               {
                  key: "missing",
                  title: "Thiếu linh kiện",
                  icon: <Square size={16} />,
               },
               {
                  key: "done",
                  title: "Đã đủ linh kiện",
                  icon: <Square size={16} weight="fill" />,
               },
            ]}
         />

         {api_tasks.isPending && (
            <section id="loading">
               <Skeleton />
               <Skeleton />
               <Skeleton />
               <Skeleton />
               <Skeleton />
            </section>
         )}

         {api_tasks.isError && (
            <section id="error">
               <Result title="Có lỗi đã xảy ra" status="error" subTitle="Đã có lỗi xảy ra" />
            </section>
         )}

         {api_tasks.isSuccess &&
            ((tab === "missing" && tasksByCategory.missing.length === 0) ||
               (tab === "done" && tasksByCategory.done.length === 0)) && (
               <>
                  <Card>
                     <Empty description="Không có tác vụ nào" />
                  </Card>
               </>
            )}

         {api_tasks.isSuccess &&
            ((tasksByCategory.done.length !== 0 && tab === "done") ||
               (tasksByCategory.missing.length !== 0 && tab === "missing")) && (
               <>
                  <section id="filter-and-search" className="flex items-center justify-between">
                     <Button type="text" size="small" onClick={() => sortDrawerRef.current?.handleOpen(sort)}>
                        Sắp xếp:{" "}
                        {(function () {
                           switch (sort.type) {
                              case "createdAt":
                                 return "Ngày tạo"
                              case "priority":
                                 return "Ưu tiên"
                              case "spareParts":
                                 return "Số linh kiện cần"
                              case "name":
                                 return "Tên tác vụ"
                           }
                        })()}
                        <span className="ml-1">
                           {sort.order === "asc" ? <ArrowUp className="inline" /> : <ArrowDown className="inline" />}
                        </span>
                     </Button>
                     <Button icon={<FilterOutlined />} type="text" size="small">
                        Lọc
                     </Button>
                  </section>
                  <section id="list" className="mt-2 flex flex-col gap-2">
                     {tab === "missing" &&
                        tasksByCategory.missing.map((task) => (
                           <TaskCard
                              task={task}
                              key={task.id}
                              onClick={() => router.push(`/stockkeeper/mobile/tasks/${task.id}`)}
                           />
                        ))}
                     {tab === "done" &&
                        tasksByCategory.done.map((task) => (
                           <TaskCard
                              task={task}
                              key={task.id}
                              onClick={() => router.push(`/stockkeeper/mobile/tasks/${task.id}`)}
                           />
                        ))}
                  </section>
               </>
            )}
         <SortDrawer ref={sortDrawerRef} setSort={setSort} />
      </main>
   )
}

function sortTasks(tasks: TaskDto[], sort: Sort) {
   return tasks.sort((a, b) => {
      let result = 0
      if (sort.type === "createdAt") {
         result = dayjs(a.createdAt).diff(dayjs(b.createdAt))
      } else if (sort.type === "priority") {
         result = a.priority ? -1 : 1
      } else if (sort.type === "spareParts") {
         result = a.issues?.length - b.issues?.length
      } else if (sort.type === "name") {
         result = a.name.localeCompare(b.name)
      }

      return sort.order === "asc" ? result : -result
   })
}

export default Page
