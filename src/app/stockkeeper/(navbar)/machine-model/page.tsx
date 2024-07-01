"use client"

import RootHeader from "@/common/components/RootHeader"
import { Button, Card, Divider, List } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { useInfiniteQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { RightOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { useTranslation } from "react-i18next"
import Stockkeeper_MachineModel_All from "../../_api/machine-model/getAll.api"
import { MachineModelDto } from "@/common/dto/MachineModel.dto"

export default function TasksPage() {
   const searchParams = useSearchParams()
   const page = Number(searchParams.get("page")) ?? 1
   const limit = 5
   const router = useRouter()
   const { t } = useTranslation()

   const result = useInfiniteQuery({
      queryKey: qk.task.all(page, limit),
      queryFn: (req) => Stockkeeper_MachineModel_All({ page: req.pageParam, limit }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
         return lastPageParam + 1
      },
   })

   return (
      <div
         style={{
            display: "grid",
            gridTemplateColumns: "[outer-start] 16px [inner-start] 1fr [inner-end] 16px [outer-end] 0",
         }}
      >
         <RootHeader
            title="Tasks"
            className="p-4"
            style={{
               gridColumn: "outer-start / outer-end",
            }}
         />
         <div
            onChange={(e) => {
               router.push(`/stockkeeper/machine-model=${e}`)
            }}
         >
            <ListView
               total={result.data?.pages[0].total ?? 0}
               loadMore={result.fetchNextPage}
               loading={result.isLoading}
               items={result.data?.pages.flatMap((res) => res.list) ?? []}
            />
         </div>
      </div>
   )
}

type ListViewType = {
   items: MachineModelDto[]
   loading: boolean
   loadMore: () => void
   total: number
}

function ListView(props: ListViewType) {
   const { t } = useTranslation()
   const router = useRouter()
   return (
      <List
         loading={props.loading}
         loadMore={
            props.items.length !== 0 &&
            (props.total === props.items.length ? (
               <Divider className="text-sm">{t("endList")}</Divider>
            ) : (
               <Button onClick={props.loadMore}>Load More</Button>
            ))
         }
         dataSource={props.items}
         itemLayout={"horizontal"}
         size={"small"}
         renderItem={(item) => (
            <Card
               key={item.id}
               title={item.name}
               extra={<Button icon={<RightOutlined />} size="small" type="text" />}
               size="small"
               className="mb-3"
               hoverable={true}
               onClick={() => router.push(`/stockkeeper/spare-part/${item.id}`)}
            >
               <ProDescriptions
                  size="small"
                  dataSource={item}
                  columns={[
                     {
                        key: "mm",
                        label: t("Name"),
                        render: (_, e) => e.name ?? "-",
                     },
                     {
                        key: "manufacturer",
                        label: t("Manufaturer"),
                        render: (_, e) => e.manufacturer ?? "-",
                     },
                     {
                        key: "yearOfProduction",
                        label: t("Year of Production"),
                        render: (_, e) => e.yearOfProduction ?? "-"
                     },
                  ]}
               />
            </Card>
         )}
      />
   )
}
