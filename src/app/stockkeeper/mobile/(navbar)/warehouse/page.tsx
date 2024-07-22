"use client"

import RootHeader from "@/common/components/RootHeader"
import { Button, Card, Divider, List } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { RightOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { useTranslation } from "react-i18next"
import Stockkeeper_MachineModel_All from "../../../_api/machine-model/getAll.api"
import { MachineModelDto } from "@/common/dto/MachineModel.dto"

export default function MachineModelPage() {
   const result = useQuery({
      queryKey: qk.task.all(),
      queryFn: () => Stockkeeper_MachineModel_All({ page: 1, limit: 1000 }),
   })
   const { t } = useTranslation()
   // const result = useInfiniteQuery({
   //    queryKey: qk.task.all(page, limit),
   //    queryFn: (req) => Stockkeeper_MachineModel_All({ page: req.pageParam, limit }),
   //    initialPageParam: 1,
   //    getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
   //       return lastPageParam + 1
   //    },
   // })

   return (
      <div className="std-layout">
         <RootHeader title="Kho hàng" className="std-layout-outer p-4" />
         <div className={"mt-3"}>
            <ListView total={result.data?.total ?? 0} loading={result.isLoading} items={result.data?.list ?? []} />
         </div>
      </div>
   )
}

type ListViewType = {
   items: MachineModelDto[]
   total: number
   loading: boolean
}

function ListView(props: ListViewType) {
   const { t } = useTranslation()
   const router = useRouter()
   return (
      <List
         loading={props.loading}
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
               onClick={() => router.push(`/stockkeeper/mobile/warehouse/${item.id}`)}
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
                        label: t("Manufacturer"),
                        render: (_, e) => e.manufacturer ?? "-",
                     },
                     {
                        key: "yearOfProduction",
                        label: t("YearOfProduction"),
                        render: (_, e) => e.yearOfProduction ?? "-",
                     },
                  ]}
               />
            </Card>
         )}
      />
   )
}
