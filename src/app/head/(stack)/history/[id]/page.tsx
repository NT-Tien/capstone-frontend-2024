"use client"

import ClickableArea from "@/components/ClickableArea"
import DateViewSwitcher from "@/components/DateViewSwitcher"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import PageError from "@/components/PageError"
import PageLoader from "@/components/PageLoader"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import FeedbackDrawer, { FeedbackDrawerProps } from "@/features/head-department/components/overlay/Feedback.drawer"
import RequestStatusTag from "@/features/head-department/components/RequestStatusTag"
import head_department_queries from "@/features/head-department/queries"
import hd_uris from "@/features/head-department/uri"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import { DownOutlined, PlusOutlined, UpOutlined } from "@ant-design/icons"
import { Divider, Image } from "antd"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

function Page({ params }: { params: { id: string } }) {
   const router = useRouter()
   const [canViewDetails, setCanViewDetails] = useState(false)
   const control_feedbackDrawer = useRef<RefType<FeedbackDrawerProps>>(null)

   const api_request = head_department_queries.request.oneById({ id: params.id })

   if (api_request.isPending) {
      return <PageLoader />
   }

   if (api_request.isError) {
      return <PageError />
   }

   return (
      <div className="relative">
         <PageHeaderV2
            type="light"
            prevButton={<PageHeaderV2.BackButton onClick={() => router.push(hd_uris.navbar.history)} />}
            title="Chi tiết yêu cầu"
            nextButton={<PageHeaderV2.InfoButton />}
            className="sticky top-0 z-50 bg-inherit"
         />
         {api_request.data.status === FixRequestStatus.HEAD_CONFIRM && (
            <section className="relative z-10 mb-3 px-layout">
               <ClickableArea
                  className="w-full bg-yellow-200 p-3 text-yellow-700"
                  onClick={() => {
                     control_feedbackDrawer.current?.handleOpen({ requestId: params.id })
                  }}
               >
                  <PlusOutlined />
                  <h1 className="font-bold">Đánh giá sửa chữa</h1>
               </ClickableArea>
            </section>
         )}
         {api_request.data.status === FixRequestStatus.CLOSED && (
            <section className="relative z-10 mb-3 px-layout">
               <div className="w-full bg-white p-3">
                  <h1 className="font-semibold">Đánh giá</h1>
                  <p className="text-neutral-500">{api_request.data?.feedback?.content}</p>
               </div>
            </section>
         )}
         <div className="absolute left-0 top-0 z-0 h-48 w-full bg-head_department" />
         <section className="px-layout">
            <Image
               alt="Image"
               src={api_request.data.device.machineModel.image}
               rootClassName="w-full"
               className="aspect-square rounded-lg object-fill"
            />
         </section>
         <section className="mt-layout-half flex translate-y-0.5 justify-between px-layout text-sm">
            <div className="flex items-center gap-1">
               Khu vực {api_request.data.device.area.name} ({api_request.data.device.positionX},{" "}
               {api_request.data.device.positionY})
            </div>
            <div className="w-max">
               <RequestStatusTag status={api_request.data.status} className="text-sm" />
            </div>
         </section>
         <section className="mt-0 flex items-start gap-3 px-layout">
            <h1 className="line-clamp-2 text-xl font-bold">{api_request.data.device.machineModel.name}</h1>
         </section>
         <section className="mt-layout-half flex px-layout">
            <h2 className="mr-auto inline font-medium">Ngày tạo: </h2>
            <p className="inline text-neutral-500">
               <DateViewSwitcher date={api_request.data.createdAt} />
            </p>
         </section>
         <section className="mt-1 px-layout">
            <header className="flex">
               <h2 className="mr-auto inline font-medium">Vấn đề: </h2>
               <p className="inline text-neutral-500" onClick={() => setCanViewDetails((prev) => !prev)}>
                  {api_request.data.requester_note.split(":")[0]}
                  {canViewDetails ? <UpOutlined className="ml-1 text-xs" /> : <DownOutlined className="ml-1 text-xs" />}
               </p>
            </header>
            {canViewDetails && (
               <>
                  <div className="mt-1 text-neutral-500">{api_request.data.requester_note.split(":")[1]}</div>
                  <Divider className="mb-0 mt-2" />
               </>
            )}
         </section>
         {api_request.data.checker && (
            <section className="mt-layout-half flex px-layout">
               <h2 className="mr-auto inline font-medium">Nhân viên kiểm tra: </h2>
               <p className="inline text-neutral-500">{api_request.data.checker.username}</p>
            </section>
         )}
         <OverlayControllerWithRef ref={control_feedbackDrawer}>
            <FeedbackDrawer
               onSuccess={() => router.push(`${hd_uris.navbar.history}?status=${"closed" as FixRequestStatuses}`)}
            />
         </OverlayControllerWithRef>
      </div>
   )
}

export default Page
