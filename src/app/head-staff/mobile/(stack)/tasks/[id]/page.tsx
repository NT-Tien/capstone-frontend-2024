"use client"

import HeadStaff_Task_OneById from "@/app/head-staff/_api/task/one-byId.api"
import DetailsTab from "@/app/head-staff/mobile/(stack)/tasks/[id]/DetailsTab.componen"
import DeviceTab from "@/app/head-staff/mobile/(stack)/tasks/[id]/DeviceTab.component"
import IssuesTab from "@/app/head-staff/mobile/(stack)/tasks/[id]/IssuesTab.component"
import RootHeader from "@/common/components/RootHeader"
import qk from "@/common/querykeys"
import Image from "next/image"
import PageHeader from "@/common/components/PageHeader"
import { CheckSquareOffset, MapPin, Wrench } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, Result, Spin, Tabs } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { NotFoundError } from "@/common/error/not-found.error"
import StepDetails from "./StepDetails.component"

export default function TaskDetails({ params }: { params: { id: string } }) {
   return (
      <Suspense fallback={<Spin fullscreen />}>
         <Component
            params={params}
            searchParams={{
               viewingHistory: undefined,
            }}
         />
      </Suspense>
   )
}

function Component({ params, searchParams }: { params: { id: string }; searchParams: { viewingHistory?: string } }) {
   const router = useRouter()
   const [tab, setTab] = useState("details")

   function handleBack() {
      if (searchParams.viewingHistory === "true") {
         router.back()
      } else {
         router.push(`/head-staff/mobile/tasks`)
      }
   }

   const api = useQuery({
      queryKey: qk.task.one_byId(params.id),
      queryFn: () => HeadStaff_Task_OneById({ id: params.id }),
   })

   return (
      <div className="std-layout relative h-max min-h-full bg-white pb-24">
         <PageHeader
            title={searchParams.viewingHistory === "true" ? "Quay Lại | Tác vụ" : "Tác vụ"}
            handleClickIcon={handleBack}
            icon={PageHeader.BackIcon}
            className="std-layout-outer relative z-30"
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
            }}
         />
         {api.isError ? (
            <>
               {api.error instanceof NotFoundError ? (
                  <Card>
                     <Result
                        status="404"
                        title="Không tìm thấy yêu cầu"
                        subTitle="Yêu cầu không tồn tại hoặc đã bị xóa"
                        extra={<Button onClick={handleBack}>Quay lại</Button>}
                     />
                  </Card>
               ) : (
                  <Card>
                     <Result
                        status="error"
                        title="Có lỗi xảy ra"
                        subTitle="Vui lòng thử lại sau"
                        extra={[
                           <Button onClick={handleBack} key="back">
                              Quay lại
                           </Button>,
                           <Button onClick={() => api.refetch()} key="retry">
                              Thử lại
                           </Button>,
                        ]}
                     />
                  </Card>
               )}
            </>
         ) : (
            <>
               <div>
                  <h3 className="text-lg font-semibold leading-8 text-neutral-700">CHI TIẾT TÁC VỤ</h3>
                  <section className="relative z-50 rounded-lg border-2 border-neutral-200 bg-white shadow-lg">
                     <DetailsTab api={api} setTab={setTab} />
                  </section>
               </div>
               <div className="mt-layout">
                  <h3 className="text-lg font-semibold leading-8 text-neutral-700">THÔNG TIN THIẾT BỊ</h3>
                  <section className="relative z-50 rounded-lg border-2 border-neutral-200 bg-white shadow-lg">
                     <DeviceTab api={api} />
                  </section>
               </div>
               <div className="mt-layout">
                  <h3 className="text-lg font-semibold leading-8 text-neutral-700">CHI TIẾT VẤN ĐỀ</h3>
                  <section className="relative z-50 rounded-lg border-2 border-neutral-200 bg-white shadow-lg">
                     <IssuesTab api_task={api} />
                  </section>{" "}
               </div>
               <div className="mt-layout">
                  <h3 className="text-lg font-semibold leading-8 text-neutral-700">TRẠNG THÁI SỬA CHỮA</h3>
                  <section className="relative z-50 rounded-lg border-2 border-neutral-200 bg-white shadow-lg">
                     <StepDetails api={api} />
                  </section>
               </div>
            </>
         )}
         {/* <RootHeader
            title="Thông tin chi tiết"
            icon={<LeftOutlined />}
            onIconClick={() =>
               api.isSuccess
                  ? searchParams.get("goto") === "request"
                     ? router.push(`/head-staff/mobile/requests/${api.data.request.id}/approved?tab=tasks`)
                     : router.push("/head-staff/mobile/tasks")
                  : undefined
            }
            className="std-layout-outer p-4"
         />
         <Tabs
            className="main-tabs std-layout-outer"
            type="line"
            activeKey={tab}
            onChange={(key) => setTab(key)}
            items={[
               {
                  key: "details",
                  label: (
                     <div className="flex items-center gap-2">
                        <CheckSquareOffset size={16} />
                        Tác vụ
                     </div>
                  ),
               },
               {
                  key: "device",
                  label: (
                     <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        Thiết bị
                     </div>
                  ),
               },
               {
                  key: "issues",
                  label: (
                     <div className="flex items-center gap-2">
                        <Wrench size={16} />
                        Vấn đề
                     </div>
                  ),
               },
            ]}
         />

         {tab === "details" && <DetailsTab api={api} setTab={setTab} />}
         {tab === "device" && <DeviceTab api={api} />}
         {tab === "issues" && <IssuesTab api_task={api} />} */}
      </div>
   )
}
