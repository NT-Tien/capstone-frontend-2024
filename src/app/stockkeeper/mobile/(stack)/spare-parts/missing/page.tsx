"use client"

import { stockkeeper_qk } from "@/app/stockkeeper/_api/qk"
import Stockkeeper_SparePart_AllAddMore, { Response } from "@/app/stockkeeper/_api/spare-part/all-addmore"
import RootHeader from "@/components/layout/RootHeader"
import { FilterOutlined, LeftOutlined, MoreOutlined } from "@ant-design/icons"
import { ExclamationMark, TrayArrowDown, Warehouse, WashingMachine } from "@phosphor-icons/react"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { Button, Divider, Dropdown, Empty, FloatButton, Input, Spin, Tag } from "antd"
import { useRouter } from "next/navigation"
import { Fragment, useMemo, useRef, useState } from "react"
import SortDrawer, { Sort, SortDrawerRefType } from "./Sort.drawer"
import SparePartDetailsDrawer, { SparePartDetailsDrawerRefType } from "../SparePartDetails.drawer"
import dayjs from "dayjs"
import { cn } from "@/lib/utils/cn.util"

function Page() {
   const router = useRouter()
   const [sort, setSort] = useState<Sort>({ type: "name", order: "asc" })

   const sortDrawerRef = useRef<SortDrawerRefType | null>(null)
   const sparePartDetailsDrawerRef = useRef<SparePartDetailsDrawerRefType | null>(null)

   const api_spareParts = useQuery({
      queryKey: stockkeeper_qk.sparePart.allNeedMore(),
      queryFn: Stockkeeper_SparePart_AllAddMore,
      select: (data) => {
         return Object.values(data)
      },
   })

   const renderList = useMemo(() => {
      if (!api_spareParts.isSuccess) return
      return sortSpareParts(api_spareParts.data, sort)
   }, [api_spareParts.isSuccess, api_spareParts.data, sort])

   return (
      <div className="std-layout min-h-screen bg-white">
         <RootHeader
            title="Linh kiện hết hàng"
            className="std-layout-outer mb-layout border-b-[1px] border-b-neutral-200 p-4 shadow-none"
            onIconClick={() => router.back()}
            icon={<LeftOutlined />}
         />
         <section id="search-spare-parts">
            <Input.Search placeholder="Tìm kiếm" />
         </section>
         <section id="sort-and-filter" className="mt-3 flex justify-between">
            <Button
               type="text"
               size="small"
               onClick={() =>
                  sortDrawerRef.current?.handleOpen({
                     sort,
                  })
               }
            >
               Sắp xếp:{" "}
               {(function () {
                  switch (sort.type) {
                     case "name":
                        return "Tên"
                     case "createdAt":
                        return "Ngày tạo"
                     case "quantityNeeded":
                        return "Số lượng cần thêm"
                     case "needToday":
                        return "Cần thêm hôm nay"
                  }
               })()}
               {sort.order === "asc" ? " ↑" : " ↓"}
            </Button>
            <Button type="text" size="small" icon={<FilterOutlined />}>
               Lọc
            </Button>
         </section>
         <Divider className="std-layout-outer my-3" />
         <section id="list" className="std-layout-outer grid grid-cols-1">
            <FloatButton.BackTop />
            {api_spareParts.isPending && (
               <div className="grid place-items-center py-48">
                  <Spin />
               </div>
            )}
            {renderList?.length === 0 && (
               <div className="grid place-items-center rounded-lg bg-white py-32">
                  <Empty description="Không có linh kiện nào hết hàng" />
               </div>
            )}
            {renderList?.map((item, index, array) => {
               const { sparePart, tasks, quantityNeedToAdd } = item
               return (
                  <Fragment key={sparePart.id}>
                     {index !== 0 && <Divider className="my-0" />}
                     <div
                        className={cn(
                           "flex px-layout py-2",
                           tasks.find((task) => task.priority === true) && "bg-red-100",
                        )}
                     >
                        <div
                           className={cn("flex-grow")}
                           onClick={() =>
                              sparePartDetailsDrawerRef.current?.handleOpen({
                                 sparePart: sparePart,
                                 specificUpdate: {
                                    tasks,
                                    quantityNeedToAdd,
                                 },
                              })
                           }
                        >
                           <div className="flex items-center justify-between">
                              <h5 className="truncate text-base text-neutral-700">{sparePart.name}</h5>
                              {tasks.find((task) => task.priority === true) && <Tag color="red-inverse">Ưu tiên</Tag>}
                           </div>
                           <div className="mt-1 grid grid-cols-12 gap-2 text-neutral-400">
                              <span className="col-span-2 flex items-center gap-1 text-red-500">
                                 <Warehouse size={16} weight="duotone" />
                                 {sparePart.quantity}
                              </span>
                              <span className="col-span-3 flex items-center gap-1 text-primary-500">
                                 <TrayArrowDown size={16} weight="duotone" />
                                 Cần {quantityNeedToAdd}
                              </span>
                              <span className="col-span-7 flex items-center gap-1 truncate">
                                 <WashingMachine size={16} weight="duotone" />
                                 {sparePart.machineModel.name}
                              </span>
                           </div>
                        </div>
                        <Dropdown
                           menu={{
                              items: [
                                 {
                                    label: "Cập nhật số lượng",
                                    key: "update-stock",
                                 },
                              ],
                           }}
                        >
                           <Button type="text" icon={<MoreOutlined />} size="small"></Button>
                        </Dropdown>
                     </div>
                  </Fragment>
               )
            })}
         </section>
         <SortDrawer setSort={setSort} ref={sortDrawerRef} />
         <SparePartDetailsDrawer ref={sparePartDetailsDrawerRef} refetchFn={api_spareParts.refetch} />
      </div>
   )
}

function sortSpareParts(data: Response[0][], sort: Sort): Response[0][] {
   return data.sort((a, b) => {
      let result = 0
      if (sort.type === "name") {
         result = a.sparePart.name.localeCompare(b.sparePart.name)
      } else if (sort.type === "createdAt") {
         result = dayjs(a.sparePart.createdAt).diff(dayjs(b.sparePart.createdAt))
      } else if (sort.type === "quantityNeeded") {
         result = a.quantityNeedToAdd - b.quantityNeedToAdd
      } else if (sort.type === "needToday") {
         const aHasTodayTask = a.tasks.find((task) =>
            task.fixerDate ? dayjs(task.fixerDate).isSame(dayjs(), "day") : false,
         )
         const bHasTodayTask = b.tasks.find((task) =>
            task.fixerDate ? dayjs(task.fixerDate).isSame(dayjs(), "day") : false,
         )
         result = aHasTodayTask ? 1 : bHasTodayTask ? -1 : 0
      }

      return sort.order === "asc" ? result : -result
   })
}

export default Page
