"use client"

import PageHeader from "@/components/layout/PageHeader"
import { FixRequest_StatusData, FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { CheckSquare, SealWarning } from "@phosphor-icons/react"
import { Button, Card, Divider, Input, List, Result, Select, Skeleton, Space, Tag } from "antd"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FilterOutlined, SearchOutlined, TruckFilled } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import headstaff_qk from "@/features/head-maintenance/qk"
import HeadStaff_Request_All30Days from "@/features/head-maintenance/api/request/all30Days.api"
import { cn } from "@/lib/utils/cn.util"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import dayjs from "dayjs"
import RequestCard from "@/features/head-maintenance/components/RequestCard"
import HeadMaintenanceNavigaionDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"
import head_maintenance_queries from "@/features/head-maintenance/queries"

function Page({ searchParams }: { searchParams: { status?: FixRequestStatus } }) {
   const router = useRouter()
   const [tab, setTab] = useState<FixRequestStatus>(searchParams?.status ?? FixRequestStatus.PENDING)
   const navDrawer = HeadMaintenanceNavigaionDrawer.useDrawer()
   const api_requestStatistics = head_maintenance_queries.request.statistics({})

   function handleChangeTab(tab: FixRequestStatus) {
      setTab(tab)

      const tabURL = new URLSearchParams()
      tabURL.set("status", tab)
      router.push("/head-staff/mobile/requests?" + tabURL.toString())
   }

   return (
      <div className="std-layout relative h-full min-h-screen bg-white">
         <PageHeader
            title="Yêu cầu"
            className="std-layout-outer relative z-30"
            icon={PageHeader.NavIcon}
            handleClickIcon={() => navDrawer.handleOpen()}
         />
         <Image
            className="std-layout-outer absolute h-32 w-full object-cover opacity-40"
            src="/images/requests.jpg"
            alt="image"
            width={784}
            height={100}
            style={{
               WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               objectFit: "fill",
            }}
         />
         <Input
            type="text"
            className="relative z-30 mb-2 w-full rounded-full border border-neutral-200 bg-neutral-100 px-4 py-3"
            placeholder="Tìm kiếm"
            prefix={<SearchOutlined className="mr-2" />}
            suffix={<FilterOutlined />}
         />
         <Select
            className="mb-3 mt-2 w-full text-center"
            value={tab}
            size="large"
            loading={api_requestStatistics.isPending}
            onChange={(value) => handleChangeTab(value as FixRequestStatus)}
         >
            {(["pending", "approved", "in_progress", "head_confirm", "closed", "rejected"] as FixRequestStatuses[]).map(
               (status, index, array) => (
                  <Select.Option
                     key={FixRequest_StatusData(status).statusEnum}
                     value={FixRequest_StatusData(status).statusEnum}
                  >
                     <div className={cn("flex items-center justify-center gap-3 break-words text-center font-base")}>
                        {FixRequest_StatusData(status).text} (
                        {api_requestStatistics.isSuccess
                           ? api_requestStatistics.data[status.toUpperCase() as FixRequestStatus]
                           : "-"}
                        )
                     </div>
                  </Select.Option>
               ),
            )}
         </Select>
         <TabDetails status={tab} />
      </div>
   )
}

type TabDetailsProps = {
   status: FixRequestStatus
}

function TabDetails(props: TabDetailsProps) {
   const router = useRouter()
   const api_requests = useQuery({
      queryKey: headstaff_qk.request.all({
         page: 1,
         limit: 500,
         status: props.status,
      }),
      queryFn: () =>
         HeadStaff_Request_All30Days({
            page: 1,
            limit: 500,
            status: props.status,
         }),
   })

   if (!api_requests.isSuccess) {
      if (api_requests.isPending) {
         return <Skeleton className="mt-layout" active />
      }

      if (api_requests.isError) {
         return (
            <Card className="mt-layout">
               <Result
                  title="Có lỗi xảy ra"
                  subTitle="Vui lòng thử lại sau"
                  extra={<Button onClick={() => api_requests.refetch()}>Thử lại</Button>}
               />
            </Card>
         )
      }
   }

   return (
      <List
         rowKey="id"
         // split
         className="std-layout-outer min-h-screen"
         dataSource={api_requests.data?.list}
         renderItem={(item, index) => (
            <List.Item className={cn("w-full", index === 0 && "mt-0")}>
               <RequestCard.Large
                  className={cn(
                     "w-full px-layout",
                     item.is_seen === false &&
                        "border-[1px] border-green-100 bg-green-100 transition-all hover:bg-green-200",
                  )}
                  headerClassName={cn(item.is_seen === false && "rounded-lg p-1")}
                  description={item.requester_note}
                  footerLeft={
                     <div>
                        {item.is_warranty && (
                           <Tag color="orange-inverse">
                              <TruckFilled /> Bảo hành
                           </Tag>
                        )}
                        {item.status === FixRequestStatus.REJECTED ? (
                           <div className="w-32 truncate">Lý do: {item.checker_note}</div>
                        ) : undefined}
                        {(item.status === FixRequestStatus.APPROVED ||
                           item.status === FixRequestStatus.IN_PROGRESS) && (
                           <Space split={<Divider type="vertical" className="mx-1" />}>
                              <div className="flex items-center gap-1">
                                 <SealWarning size={16} />
                                 <span>{item?.issues?.length ?? "0"} lỗi</span>
                              </div>
                              <div className="flex items-center gap-1">
                                 <CheckSquare size={16} />
                                 <span>{item?.tasks?.length ?? "0"} tác vụ</span>
                              </div>
                           </Space>
                        )}
                     </div>
                  }
                  tag={
                     <span className="flex items-start justify-end text-xs text-neutral-500">{getCreatedAt(item)}</span>
                  }
                  subtitle={`${item.requester.username} | ${item?.device?.area?.name}`}
                  title={item.device.machineModel.name}
                  onClick={() => {
                     const statuses = new Set([FixRequestStatus.PENDING, FixRequestStatus.REJECTED])
                     if (statuses.has(item.status)) {
                        router.push(`/head-staff/mobile/requests/${item.id}`)
                     } else {
                        router.push(`/head-staff/mobile/requests/${item.id}/approved`)
                     }
                  }}
                  footerRight={<div></div>}
                  // tag={
                  //    item.is_seen === false && (
                  //       <Tag color="green" className="m-0">
                  //          Mới
                  //       </Tag>
                  //    )
                  // }
                  footerClassName="mt-1"
               />
            </List.Item>
         )}
      />
   )
}

function getCreatedAt(request: RequestDto) {
   const dateRaw = request.createdAt
   const date = dayjs(dateRaw).locale("vi")
   const now = dayjs()

   if (now.isSame(date, "day")) {
      return date.fromNow()
   } else {
      return date.format("DD/MM/YYYY")
   }
}

export default Page
