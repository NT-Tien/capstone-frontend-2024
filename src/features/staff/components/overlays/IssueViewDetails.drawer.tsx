"use client"

import { Button, Card, Descriptions, Drawer, DrawerProps, Dropdown, Empty, Image, List, Segmented } from "antd"
import {
   BookOutlined,
   CloseOutlined,
   DownOutlined,
   MoreOutlined,
   SettingOutlined,
   UpOutlined,
   WarningOutlined,
} from "@ant-design/icons"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { ChartDonut, FileText, Gear, SealWarning } from "@phosphor-icons/react"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import { cn } from "@/lib/utils/cn.util"
import { useEffect, useRef, useState } from "react"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import IssueFailDrawer, { IssueFailDrawerProps } from "@/features/staff/components/overlays/Issue_Fail.drawer"
import ResolveIssueDrawer, { ResolveIssueDrawerProps } from "@/features/staff/components/overlays/ResolveIssue.drawer"
import { clientEnv } from "@/env"
import ImageUploader from "@/components/ImageUploader"
import VideoUploader from "@/components/VideoUploader"

type IssueViewDetailsDrawerProps = {
   issue?: IssueDto
   refetchFn?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   IssueViewDetailsDrawerProps & {
      handleClose?: () => void
   }

function IssueViewDetailsDrawer(props: Props) {
   const [showTypeErrorDescription, setShowTypeErrorDescription] = useState<boolean>(false)
   const [tab, setTab] = useState<"spare-parts" | "evidence">("spare-parts")

   const control_issueFailDrawer = useRef<RefType<IssueFailDrawerProps>>(null)
   const control_issueResolveDrawer = useRef<RefType<ResolveIssueDrawerProps>>(null)

   useEffect(() => {
      if (!props.open) {
         setShowTypeErrorDescription(false)
      }
   }, [props.open])

   useEffect(() => {
      if (props.issue?.status === IssueStatusEnum.RESOLVED) {
         setTab("evidence")
      } else {
         setTab("spare-parts")
      }
   }, [props.issue?.status])

   function Footer() {
      if (props.issue?.status === IssueStatusEnum.PENDING) {
         return (
            <div className={"flex items-center gap-2"}>
               <Button
                  block
                  type={"primary"}
                  size={"large"}
                  onClick={() =>
                     control_issueResolveDrawer.current?.handleOpen({
                        issue: props.issue,
                     })
                  }
               >
                  Hoàn thành lỗi
               </Button>
               <Dropdown
                  menu={{
                     items: [
                        {
                           label: "Lỗi không hoàn thành được",
                           key: "cancel-issue",
                           danger: true,
                           icon: <WarningOutlined />,
                           onClick: () =>
                              props.issue &&
                              control_issueFailDrawer.current?.handleOpen({
                                 issueId: props.issue.id,
                              }),
                        },
                     ],
                  }}
               >
                  <Button size={"large"} icon={<MoreOutlined />} className={"aspect-square"} />
               </Dropdown>
            </div>
         )
      }
   }

   return (
      <Drawer
         title={
            <div className={"flex items-center justify-between"}>
               <Button icon={<CloseOutlined className={"text-white"} />} type={"text"} onClick={props.onClose} />
               <h1>Thông tin lỗi</h1>
               <Button icon={<MoreOutlined className={"text-white"} />} type={"text"} />
            </div>
         }
         classNames={{
            header: "bg-staff text-white",
            footer: "p-layout",
         }}
         closeIcon={false}
         placement={"bottom"}
         height="85%"
         loading={!props.issue}
         footer={<Footer />}
         {...props}
      >
         {props.issue && (
            <>
               <Descriptions
                  colon={false}
                  contentStyle={{
                     display: "flex",
                     justifyContent: "end",
                  }}
                  items={[
                     {
                        label: (
                           <div className={"flex items-center gap-1"}>
                              <SealWarning size={18} weight={"fill"} />
                              <span>Tên lỗi</span>
                           </div>
                        ),
                        children: (
                           <div className={"flex flex-col items-end text-right"}>
                              <div className={"font-bold"} onClick={() => setShowTypeErrorDescription((prev) => !prev)}>
                                 {props.issue.typeError.name}
                                 <button>
                                    {showTypeErrorDescription ? (
                                       <UpOutlined className={"ml-2 text-xs"} />
                                    ) : (
                                       <DownOutlined className={"ml-2 text-xs"} />
                                    )}
                                 </button>
                              </div>
                              {showTypeErrorDescription ? (
                                 <div className={"text-sm text-neutral-500"}>{props.issue.typeError.description}</div>
                              ) : (
                                 <div className={"w-48 truncate text-right text-sm text-neutral-500"}>
                                    {props.issue.typeError.description}
                                 </div>
                              )}
                           </div>
                        ),
                     },
                     {
                        label: (
                           <div className={"flex items-center gap-1"}>
                              <ChartDonut size={18} weight={"fill"} />
                              <span>Trạng thái</span>
                           </div>
                        ),
                        children: (
                           <div className={IssueStatusEnumTagMapper[props.issue.status].className}>
                              {IssueStatusEnumTagMapper[props.issue.status].text}
                           </div>
                        ),
                     },
                     {
                        label: (
                           <div className={"flex items-center gap-1"}>
                              <Gear size={18} weight={"fill"} />
                              <span>Cách sửa</span>
                           </div>
                        ),
                        children: (
                           <div
                              className={cn(FixTypeTagMapper[props.issue.fixType].className, "itesm-center flex gap-1")}
                           >
                              {FixTypeTagMapper[props.issue.fixType].icon}
                              {FixTypeTagMapper[props.issue.fixType].text}
                           </div>
                        ),
                     },
                     {
                        label: (
                           <div className={"flex items-center gap-1"}>
                              <FileText size={18} weight={"fill"} />
                              <span>Mô tả</span>
                           </div>
                        ),
                        children: props.issue.description,
                     },
                  ]}
               />
               {props.issue.status === IssueStatusEnum.FAILED && (
                  <Card
                     size={"small"}
                     className={"mt-layout bg-red-500 text-white"}
                     title={<div className="w-full text-center text-white">Lý do thất bại</div>}
                  >
                     {props.issue.failReason}
                  </Card>
               )}
               <Segmented
                  block
                  className={"mt-6"}
                  value={tab}
                  onChange={(value) => setTab(value as any)}
                  size={"large"}
                  options={[
                     {
                        label: "Linh kiện",
                        value: "spare-parts",
                        icon: <SettingOutlined />,
                     },
                     ...(props.issue.status === IssueStatusEnum.RESOLVED
                        ? [
                             {
                                label: "Minh chứng",
                                value: "evidence",
                                icon: <BookOutlined />,
                             },
                          ]
                        : []),
                  ]}
               />
               <section className={"mt-3"}>
                  {tab === "spare-parts" && (
                     <Card size={"small"} className="overflow-x-none h-40 overflow-y-auto">
                        {props.issue.issueSpareParts.length > 0 ? (
                           <List
                              dataSource={props.issue.issueSpareParts}
                              grid={{
                                 column: 2,
                                 gutter: 5,
                              }}
                              split
                              renderItem={(item, index) => (
                                 <List.Item className={cn(index === 0 && "pt-0")}>
                                    <List.Item.Meta
                                       title={<div className={"line-clamp-2 text-sm"}>{item.sparePart.name}</div>}
                                       description={<div className={"text-sm"}>x{item.quantity}</div>}
                                    />
                                 </List.Item>
                              )}
                           />
                        ) : (
                           <Empty description="Lỗi này không có linh kiện" />
                        )}
                     </Card>
                  )}
                  {tab === "evidence" && (
                     <div>
                        {props.issue.status === IssueStatusEnum.RESOLVED && (
                           <>
                              <section>
                                 <header className="mb-2">
                                    <h1 className="text-base font-bold">Hình ảnh xác nhận</h1>
                                 </header>
                                 <ImageUploader imageUris={props.issue.imagesVerify} />
                              </section>
                              <section className="mt-layout">
                                 <header className="mb-2">
                                    <h1 className="text-base font-bold">Video xác nhận</h1>
                                 </header>
                                 <VideoUploader videoUris={[props.issue.videosVerify]} />
                              </section>
                           </>
                        )}
                     </div>
                  )}
               </section>
            </>
         )}
         <OverlayControllerWithRef ref={control_issueFailDrawer}>
            <IssueFailDrawer
               onSuccess={() => {
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_issueResolveDrawer}>
            <ResolveIssueDrawer
               onFinish={() => {
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
            />
         </OverlayControllerWithRef>
      </Drawer>
   )
}

export default IssueViewDetailsDrawer
export type { IssueViewDetailsDrawerProps }
