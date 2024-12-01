"use client"

import AlertCard from "@/components/AlertCard"
import ClickableArea from "@/components/ClickableArea"
import DateViewSwitcher from "@/components/DateViewSwitcher"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import PageError from "@/components/PageError"
import PageLoader from "@/components/PageLoader"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Request_FeedbackDrawer, {
   Request_FeedbackDrawerProps,
} from "@/features/head-department/components/overlay/Request_Feedback.drawer"
import RequestStatusTag from "@/features/head-department/components/RequestStatusTag"
import head_department_mutations from "@/features/head-department/mutations"
import head_department_queries from "@/features/head-department/queries"
import hd_uris from "@/features/head-department/uri"
import { FeedbackRating } from "@/lib/domain/Feedback/FeedbackRating.enum"
import IssueUtil from "@/lib/domain/Issue/Issue.util"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import {
   CheckOutlined,
   CloseOutlined,
   DeleteOutlined,
   DownOutlined,
   MinusOutlined,
   PlusOutlined,
   UpOutlined,
} from "@ant-design/icons"
import { Headset } from "@phosphor-icons/react"
import { App, Avatar, Divider, Dropdown, Image, List } from "antd"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

function Page({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { modal } = App.useApp()

   const [canViewDetails, setCanViewDetails] = useState(false)
   const control_feedbackDrawer = useRef<RefType<Request_FeedbackDrawerProps>>(null)

   const api_request = head_department_queries.request.oneById({ id: params.id })

   const mutate_cancelRequest = head_department_mutations.request.cancelRequest()

   if (api_request.isPending) {
      return <PageLoader />
   }

   if (api_request.isError) {
      return <PageError />
   }

   return (
      <div className="relative pb-layout">
         <PageHeaderV2
            type="light"
            prevButton={<PageHeaderV2.BackButton onClick={() => router.push(hd_uris.navbar.history)} />}
            title="Chi tiết yêu cầu"
            nextButton={
               <Dropdown
                  menu={{
                     items: [
                        {
                           key: "2",
                           label: "Hỗ trợ",
                           icon: <Headset size={20} weight="fill" />,
                        },
                        {
                           key: "1",
                           label: "Hủy yêu cầu",
                           danger: true,
                           icon: <DeleteOutlined />,
                           className: cn("hidden", api_request.data.status === FixRequestStatus.PENDING && "flex"),
                           onClick: () => {
                              modal.confirm({
                                 title: "Lưu ý",
                                 content: "Bạn có chắc chắn muốn hủy yêu cầu này?",
                                 okText: "Hủy yêu cầu",
                                 cancelText: "Đóng",
                                 okButtonProps: { danger: true },
                                 onOk: () => {
                                    mutate_cancelRequest.mutate(
                                       {
                                          id: params.id,
                                       },
                                       {
                                          onSuccess: () => router.push(hd_uris.navbar.history),
                                       },
                                    )
                                 },
                                 maskClosable: true,
                                 closable: true,
                                 centered: true,
                              })
                           },
                        },
                     ],
                  }}
               >
                  <PageHeaderV2.InfoButton />
               </Dropdown>
            }
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
                  <p className="text-neutral-500">{api_request.data?.feedback?.[0]?.content}</p>
               </div>
            </section>
         )}
         <div className="absolute left-0 top-0 z-0 h-48 w-full bg-head_department" />
         <section className="px-layout">
            <Image
               alt="Image"
               src={api_request.data.old_device.machineModel.image}
               rootClassName="w-full"
               className="aspect-square rounded-lg border-2 border-blue-500 object-fill"
            />
         </section>
         <section className="mt-layout-half flex translate-y-0.5 justify-between px-layout text-sm">
            <div className="flex items-center gap-1">
               Khu vực {api_request.data.old_device.area.name} ({api_request.data.old_device.positionX},{" "}
               {api_request.data.old_device.positionY})
            </div>
            <div className="w-max">
               <RequestStatusTag status={api_request.data.status} className="text-sm" />
            </div>
         </section>
         <section className="mt-1 flex items-start gap-3 px-layout">
            <h1 className="line-clamp-2 text-xl font-bold">{api_request.data.old_device.machineModel.name}</h1>
         </section>
         <section className="mt-layout-half flex px-layout">
            <h2 className="mr-auto inline font-medium">Mã yêu cầu: </h2>
            <p className="inline text-neutral-500">{api_request.data.code}</p>
         </section>
         <section className="mt-1 flex px-layout">
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
            <section className="mt-1 flex px-layout">
               <h2 className="mr-auto inline font-medium">Nhân viên kiểm tra: </h2>
               <p className="inline text-neutral-500">{api_request.data.checker.username}</p>
            </section>
         )}
         {api_request.data.status === FixRequestStatus.REJECTED && (
            <section className="mt-1 px-layout text-red-500">
               <h2 className="mr-auto inline font-medium">Lý do từ chối: </h2>
               <p className="block text-red-500">{api_request.data.checker_note}</p>
            </section>
         )}
         <section className="mt-4 px-layout">
            {api_request.data.is_warranty && (
               <>
                  <AlertCard text="Thiết bị đang được bảo hành" type="info" />
                  <List
                     dataSource={api_request.data.issues.filter((i) => IssueUtil.isWarrantyIssue(i))}
                     size="small"
                     bordered
                     className="mt-3"
                     renderItem={(item) => {
                        return (
                           <List.Item>
                              <List.Item.Meta
                                 avatar={
                                    <Avatar
                                       size={20}
                                       className={cn(
                                          item.status === IssueStatusEnum.PENDING && "bg-gray-500",
                                          item.status === IssueStatusEnum.FAILED && "bg-red-500",
                                          item.status === IssueStatusEnum.RESOLVED && "bg-green-500",
                                          item.status === IssueStatusEnum.CANCELLED && "bg-gray-200",
                                       )}
                                       icon={(function () {
                                          switch (item.status) {
                                             case IssueStatusEnum.PENDING:
                                                return <MinusOutlined />
                                             case IssueStatusEnum.FAILED:
                                                return <CloseOutlined />
                                             case IssueStatusEnum.RESOLVED:
                                                return <CheckOutlined />
                                             case IssueStatusEnum.CANCELLED:
                                                return <DeleteOutlined />
                                             default:
                                                return <MinusOutlined />
                                          }
                                       })()}
                                    />
                                 }
                                 title={<div className="text-sm">{item.typeError.name}</div>}
                                 description={<div className="text-xs">{item.typeError.description}</div>}
                              />
                           </List.Item>
                        )
                     }}
                  />
               </>
            )}
            {api_request.data.is_fix && (
               <>
                  <AlertCard text="Thiết bị đang được sửa chữa" type="info" />
                  <List
                     dataSource={api_request.data.issues.filter((i) => IssueUtil.isFixIssue(i))}
                     size="small"
                     bordered
                     className="mt-3"
                     renderItem={(item) => {
                        return (
                           <List.Item>
                              <List.Item.Meta
                                 avatar={
                                    <Avatar
                                       size={20}
                                       className={cn(
                                          item.status === IssueStatusEnum.PENDING && "bg-gray-500",
                                          item.status === IssueStatusEnum.FAILED && "bg-red-500",
                                          item.status === IssueStatusEnum.RESOLVED && "bg-green-500",
                                          item.status === IssueStatusEnum.CANCELLED && "bg-gray-200",
                                       )}
                                       icon={(function () {
                                          switch (item.status) {
                                             case IssueStatusEnum.PENDING:
                                                return <MinusOutlined />
                                             case IssueStatusEnum.FAILED:
                                                return <CloseOutlined />
                                             case IssueStatusEnum.RESOLVED:
                                                return <CheckOutlined />
                                             case IssueStatusEnum.CANCELLED:
                                                return <DeleteOutlined />
                                             default:
                                                return <MinusOutlined />
                                          }
                                       })()}
                                    />
                                 }
                                 title={<div className="text-sm">{item.typeError.name}</div>}
                                 description={<div className="text-xs">{item.typeError.description}</div>}
                              />
                           </List.Item>
                        )
                     }}
                  />
               </>
            )}
            {api_request.data.is_rennew && (
               <>
                  <AlertCard text="Thiết bị sẽ được thay mới" type="info" />
                  <List
                     dataSource={api_request.data.issues.filter((i) => IssueUtil.isRenewIssue(i))}
                     size="small"
                     bordered
                     className="mt-3"
                     renderItem={(item) => {
                        return (
                           <List.Item>
                              <List.Item.Meta
                                 avatar={
                                    <Avatar
                                       size={20}
                                       className={cn(
                                          item.status === IssueStatusEnum.PENDING && "bg-gray-500",
                                          item.status === IssueStatusEnum.FAILED && "bg-red-500",
                                          item.status === IssueStatusEnum.RESOLVED && "bg-green-500",
                                          item.status === IssueStatusEnum.CANCELLED && "bg-gray-200",
                                       )}
                                       icon={(function () {
                                          switch (item.status) {
                                             case IssueStatusEnum.PENDING:
                                                return <MinusOutlined />
                                             case IssueStatusEnum.FAILED:
                                                return <CloseOutlined />
                                             case IssueStatusEnum.RESOLVED:
                                                return <CheckOutlined />
                                             case IssueStatusEnum.CANCELLED:
                                                return <DeleteOutlined />
                                             default:
                                                return <MinusOutlined />
                                          }
                                       })()}
                                    />
                                 }
                                 title={<div className="text-sm">{item.typeError.name}</div>}
                                 description={<div className="text-xs">{item.typeError.description}</div>}
                              />
                           </List.Item>
                        )
                     }}
                  />
               </>
            )}
         </section>
         <OverlayControllerWithRef ref={control_feedbackDrawer}>
            <Request_FeedbackDrawer
               onSuccess={(rating) => {
                  if (rating === FeedbackRating.PROBLEM_FIXED) {
                     router.push(hd_uris.navbar.history)
                  } else if (rating === FeedbackRating.PROBLEM_NOT_FIXED) {
                     router.push(hd_uris.navbar.history)
                  } else {
                     router.push(hd_uris.navbar.history)
                  }
               }}
            />
         </OverlayControllerWithRef>
      </div>
   )
}

export default Page
