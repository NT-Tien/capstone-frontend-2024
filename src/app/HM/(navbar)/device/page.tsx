"use client"

import head_maintenance_queries from "@/features/head-maintenance/queries"
import { Badge, Button, Card, Divider, Image, Input, Space, Spin } from "antd"
import { FilterOutlined, SearchOutlined } from "@ant-design/icons"
import { useMemo, useRef, useState } from "react"
import { Factory } from "@phosphor-icons/react"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import { RefType } from "@/components/utils/OverlayControllerWithRef"
import { FilterDrawerProps } from "../requests/Filter.drawer"
import HeadMaintenanceNavigationDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"

type Query = {
   search: string
}

function Page() {
   const [query, setQuery] = useState<Query>({
      search: "",
   })
   const control_filterDrawer = useRef<RefType<FilterDrawerProps>>(null)
   const api = head_maintenance_queries.device.all_statusFalse({})
   const navDrawer = HeadMaintenanceNavigationDrawer.useDrawer()

   const renderList = useMemo(() => {
      if (!api.isSuccess) return
      let list = api.data

      if (query.search) {
         list = list.filter((device) => device.machineModel.name.toLowerCase().includes(query.search.toLowerCase()))
      }

      return list.sort((a, b) => a.machineModel.name.localeCompare(b.machineModel.name))
   }, [api.data, api.isSuccess, query.search])

   return (
      <div className="std-layout relative h-full min-h-screen bg-white">
         <div className="std-layout-outer absolute left-0 top-0 h-[72px] w-full bg-head_maintenance" />
         <PageHeaderV2
            prevButton={<PageHeaderV2.MenuButton onClick={navDrawer.handleOpen} />}
            title={"Danh sách Thiết bị"}
         />
         <section className="mb-3 mt-3">
            {api.isSuccess ? (
               <>
                  <Input
                     addonBefore={<SearchOutlined />}
                     placeholder="Tìm kiếm"
                     className="mb-5"
                     value={query.search}
                     onChange={(e) => {
                        setQuery((prev) => ({ ...prev, search: e.target.value }))
                     }}
                  />
                  <main className="grid grid-cols-2 gap-3">
                     {renderList?.map((device) => (
                        <Card
                           key={device.id}
                           cover={
                              <Image
                                 src={device.machineModel.image}
                                 alt={device.machineModel.name}
                                 rootClassName="w-full h-32"
                                 wrapperClassName="w-full h-32"
                                 className="h-32 w-full rounded-t-lg object-cover"
                                 preview={false}
                              />
                           }
                           className="border border-gray-300 shadow-sm hover:border-gray-400"
                           classNames={{
                              body: "px-2 py-4",
                           }}
                        >
                           <Card.Meta
                              title={<h3 className="truncate text-sm">{device.machineModel.name}</h3>}
                              description={
                                 <Space split={<Divider type="vertical" className="m-0" />} wrap className="text-xs">
                                    <div className="flex items-center gap-1">
                                       <Factory size={16} weight="duotone" />
                                       {device.machineModel.manufacturer}
                                    </div>
                                 </Space>
                              }
                           />
                        </Card>
                     ))}
                  </main>
               </>
            ) : (
               <>
                  {api.isPending && (
                     <div className="grid h-full w-full place-items-center">
                        <Spin />
                     </div>
                  )}
               </>
            )}
         </section>
      </div>
   )
}

export default Page
