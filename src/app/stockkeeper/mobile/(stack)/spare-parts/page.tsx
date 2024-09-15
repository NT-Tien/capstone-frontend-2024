"use client"

import RootHeader from "@/common/components/RootHeader"
import { LeftOutlined, FilterOutlined } from "@ant-design/icons"
import { Button, Input } from "antd"
import { useRouter } from "next/navigation"
import SortDrawer, { Sort, SortDrawerRefType } from "./Sort.drawer"
import { useRef, useState } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { stockkeeper_qk } from "@/app/stockkeeper/_api/qk"
import Stockkeeper_SparePart_All from "@/app/stockkeeper/_api/spare-part/all.api"
import InfiniteScroll from "react-infinite-scroll-component"

function Page() {
   const router = useRouter()
   const [sort, setSort] = useState<Sort>({ type: "name", order: "asc" })
   const sortDrawerRef = useRef<SortDrawerRefType | null>(null)

   const [page, setPage] = useState(1)
   const [limit, setLimit] = useState(10)

   const api_spareParts = useInfiniteQuery({
      queryKey: stockkeeper_qk.sparePart.all({ page, limit }),
      queryFn: () => Stockkeeper_SparePart_All({ page, limit }),
      initialPageParam: page,
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
         return lastPageParam + 1
      },
   })

   return (
      <div className="std-layout">
         <RootHeader
            title="Linh kiện"
            className="std-layout-outer mb-layout p-4"
            onIconClick={() => router.back()}
            icon={<LeftOutlined />}
         />
         <section id="search-spare-parts">
            <Input.Search placeholder="Tìm kiếm" />
         </section>
         <section id="sort-and-filter" className="mt-2 flex justify-between">
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
         <section id="list" className="mt-2 grid grid-cols-2 gap-2">
            <InfiniteScroll
               dataLength={api_spareParts.data?.pages.length || 0}
               next={() => setPage((prev) => prev + 1)}
               hasMore={api_spareParts.hasNextPage}
               loader={<h4>Loading...</h4>}
               endMessage={<h4>End of list</h4>}
            >
               {api_spareParts.data?.pages.map((page) => page.list.map((sp) => <div key={sp.id} className="py-10">{sp.name}</div>))}
            </InfiniteScroll>
         </section>
         <SortDrawer setSort={setSort} ref={sortDrawerRef} />
      </div>
   )
}

export default Page
