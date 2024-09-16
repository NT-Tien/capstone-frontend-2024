"use client"

import { stockkeeper_qk } from "@/app/stockkeeper/_api/qk"
import Stockkeeper_SparePart_All from "@/app/stockkeeper/_api/spare-part/all.api"
import RootHeader from "@/common/components/RootHeader"
import { cn } from "@/common/util/cn.util"
import { FilterOutlined, LeftOutlined, MoreOutlined } from "@ant-design/icons"
import { Warehouse, WashingMachine } from "@phosphor-icons/react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Button, Divider, Dropdown, FloatButton, Input, Spin } from "antd"
import { useRouter } from "next/navigation"
import { Fragment, useMemo, useRef, useState } from "react"
import SortDrawer, { Sort, SortDrawerRefType } from "./Sort.drawer"
import SparePartDetailsDrawer, { SparePartDetailsDrawerRefType } from "./SparePartDetails.drawer"
import { useInView } from "react-intersection-observer"

function Page() {
   const router = useRouter()
   const [sort, setSort] = useState<Sort>({ type: "name", order: "asc" })

   const sortDrawerRef = useRef<SortDrawerRefType | null>(null)
   const sparePartDetailsDrawerRef = useRef<SparePartDetailsDrawerRefType | null>(null)
   const { ref, inView, entry } = useInView({
      threshold: 0.5,
      onChange: (inView, entry) => {
         if (inView) {
            api_spareParts.fetchNextPage()
         }
      },
   })

   const [page, setPage] = useState(1)
   const [limit, setLimit] = useState(50)

   const api_spareParts = useInfiniteQuery({
      queryKey: stockkeeper_qk.sparePart.all({ page, limit }),
      queryFn: () => Stockkeeper_SparePart_All({ page, limit }),
      initialPageParam: page,
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
         return lastPageParam + 1
      },
      getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) => {
         return firstPageParam - 1
      },
   })

   const visibleList = useMemo(() => {
      return api_spareParts.data?.pages.flatMap((page) => page.list)
   }, [api_spareParts.data])

   return (
      <div className="std-layout bg-white">
         <RootHeader
            title="Linh kiện"
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
                     case "quantity":
                        return "Số lượng"
                  }
               })()}
               {sort.order === "asc" ? " ↑" : " ↓"}
            </Button>
            <Button type="text" size="small" icon={<FilterOutlined />}>
               Lọc
            </Button>
         </section>
         <Divider className="std-layout-outer my-3" />
         <section id="list" className="grid grid-cols-1">
            <FloatButton.BackTop />
            {api_spareParts.isPending && (
               <div className="grid place-items-center py-48">
                  <Spin />
               </div>
            )}
            {api_spareParts.data?.pages
               .flatMap((page) => page.list)
               .map((sparePart, index, array) => (
                  <Fragment key={sparePart.id}>
                     {index !== 0 && <Divider className="my-2" />}
                     <div className="flex">
                        <div
                           className="flex-grow"
                           onClick={() => sparePartDetailsDrawerRef.current?.handleOpen({ sparePart })}
                        >
                           <h5 className="text-base text-neutral-700">{sparePart.name}</h5>
                           <div className="mt-1 grid grid-cols-12 gap-2 text-neutral-400">
                              <span
                                 className={cn(
                                    "col-span-2 flex items-center gap-1",
                                    sparePart.quantity <= 1 && "text-red-500",
                                 )}
                              >
                                 <Warehouse size={16} weight="duotone" />
                                 {sparePart.quantity}
                              </span>
                              <span className="col-span-10 flex items-center gap-1">
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
                     {visibleList?.length !== api_spareParts.data?.pages[0].total && index === array.length - 1 && (
                        <div className="flex justify-center py-6" ref={ref}>
                           <Spin>Vui lòng chờ</Spin>
                        </div>
                     )}
                  </Fragment>
               ))}
         </section>
         <SortDrawer setSort={setSort} ref={sortDrawerRef} />
         <SparePartDetailsDrawer ref={sparePartDetailsDrawerRef} refetchFn={api_spareParts.refetch} />
      </div>
   )
}

export default Page
