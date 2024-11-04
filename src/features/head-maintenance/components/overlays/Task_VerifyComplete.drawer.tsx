"use client"

import { App, Button, Descriptions, Divider, Drawer, DrawerProps, Dropdown, Image, List, Space } from "antd"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { clientEnv } from "@/env"
import AlertCard from "@/components/AlertCard"
import {
   CheckCircleFilled,
   CloseOutlined,
   DeleteOutlined,
   EditOutlined,
   MediumCircleFilled,
   MinusCircleFilled,
   MoreOutlined,
   PlusOutlined,
} from "@ant-design/icons"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import { FileImage } from "@phosphor-icons/react"
import IssueDetailsDrawer, {
   IssueDetailsDrawerProps,
} from "@/features/head-maintenance/components/overlays/Issue_Details.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { useRef, useState } from "react"
import dayjs from "dayjs"
import Issue_SelectTypeErrorDrawer, {
   CreateIssueModalRefType,
} from "@/features/head-maintenance/components/overlays/Issue_SelectTypeError.drawer"
import { useQueryClient } from "@tanstack/react-query"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import Issue_CreateDetailsDrawer, {
   CreateSingleIssueDrawerRefType,
} from "@/features/head-maintenance/components/overlays/Issue_CreateDetails.drawer"

type Task_VerifyCompleteDrawerProps = {
   task?: TaskDto
   requestId?: string
   onSubmit?: (newIssues: IssueDto[]) => void
}
type Props = Omit<DrawerProps, "children"> &
   Task_VerifyCompleteDrawerProps & {
      handleClose?: () => void
   }

function Task_VerifyCompleteDrawer(props: Props) {
   const queryClient = useQueryClient()
   const { modal } = App.useApp()

   const control_issueDetailsDrawer = useRef<RefType<IssueDetailsDrawerProps>>(null)
   const control_issueCreateDrawer = useRef<CreateIssueModalRefType | null>(null)
   const control_createIssueDetailsDrawer = useRef<CreateSingleIssueDrawerRefType | null>(null)

   const [newIssues, setNewIssues] = useState<IssueDto[]>([])

   function handleSubmit() {
      console.log(newIssues)
      props.onSubmit?.(newIssues)
      props.handleClose?.()
   }

   return (
      <>
         <Drawer
            title={
               <div className={"flex items-center justify-between"}>
                  <Button icon={<CloseOutlined className={"text-white"} />} type={"text"} onClick={props.onClose} />
                  <h1>Kiểm tra tác vụ</h1>
                  <Button icon={<MoreOutlined className={"text-white"} />} type={"text"} />
               </div>
            }
            closeIcon={false}
            height="100%"
            placement="bottom"
            footer={
               <div className={"flex items-center gap-2"}>
                  <Button size="large" block type="primary" onClick={handleSubmit}>
                     Đóng tác vụ
                  </Button>
                  <Dropdown
                     menu={{
                        items: [
                           {
                              key: "1",
                              label: "Thêm lỗi mới",
                              icon: <PlusOutlined />,
                              onClick: async () => {
                                 if (!props.requestId || !props.task) return
                                 const request = await queryClient.ensureQueryData(
                                    head_maintenance_queries.request.one.queryOptions({
                                       id: props.requestId,
                                    }),
                                 )

                                 if (!request) return

                                 control_issueCreateDrawer.current?.handleOpen({
                                    deviceId: request.device.id || "",
                                    request: request,
                                 })
                              },
                           },
                        ],
                     }}
                  >
                     <Button size={"large"} className={"aspect-square"} icon={<MoreOutlined />} />
                  </Dropdown>
               </div>
            }
            classNames={{ footer: "p-layout", header: "bg-head_maintenance text-white" }}
            {...props}
         >
            <Descriptions
               size={"small"}
               contentStyle={{
                  display: "flex",
                  justifyContent: "flex-end",
               }}
               items={[
                  {
                     label: "Thời gian hoàn thành",
                     children: props.task?.completedAt ? dayjs(props.task.completedAt).format("HH:mm DD/MM/YYYY") : "-",
                  },
                  {
                     label: "Ghi chú",
                     children: props.task?.fixerNote || "Không có",
                  },
                  {
                     label: "Minh chứng",
                     className: "*:flex-col",
                     children: (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                           {props.task?.imagesVerify.map((img) => (
                              <Image
                                 key={img}
                                 src={clientEnv.BACKEND_URL + `/file-image/${img}`}
                                 alt="Chữ ký"
                                 className="aspect-square h-max rounded-lg"
                              />
                           ))}
                        </div>
                     ),
                  },
                  {
                     label: "Lỗi được sửa",
                     className: "*:flex-col *:justify-start",
                     contentStyle: {
                        justifyContent: "start",
                        width: "100%",
                     },
                     children: (
                        <div className={"w-full"}>
                           <List
                              dataSource={props.task?.issues}
                              renderItem={(item) => {
                                 return (
                                    <List.Item
                                       onClick={() =>
                                          props.task &&
                                          control_issueDetailsDrawer.current?.handleOpen({
                                             issueId: item.id,
                                             deviceId: props.task.device.id,
                                          })
                                       }
                                    >
                                       <List.Item.Meta
                                          avatar={<CheckCircleFilled className={"text-green-500"} />}
                                          title={<div className={"line-clamp-2"}>{item.typeError.name}</div>}
                                          description={
                                             <Space split={<Divider type={"vertical"} className={"m-0"} />} wrap>
                                                <div className={FixTypeTagMapper[item.fixType].className}>
                                                   {FixTypeTagMapper[item.fixType].text}
                                                </div>
                                                {item.imagesVerify?.length > 0 || item.videosVerify ? (
                                                   <div className={"flex items-center gap-2"}>
                                                      <FileImage />
                                                      Có hình ảnh
                                                   </div>
                                                ) : undefined}
                                                <div className={"line-clamp-1"}>{item.description}</div>
                                             </Space>
                                          }
                                       />
                                    </List.Item>
                                 )
                              }}
                           />
                           {newIssues.length > 0 && (
                              <List
                                 dataSource={newIssues}
                                 renderItem={(item) => {
                                    return (
                                       <List.Item
                                          actions={[
                                             <Button
                                                key={"edit"}
                                                type={"text"}
                                                icon={<EditOutlined />}
                                                onClick={async () => {
                                                   if (!props.task) return
                                                   const device = await queryClient.ensureQueryData(
                                                      head_maintenance_queries.device.one.queryOptions({
                                                         id: props.task.device.id,
                                                      }),
                                                   )

                                                   if (!device) return

                                                   control_createIssueDetailsDrawer.current?.handleOpen({
                                                      device: device,
                                                      typeError: item.typeError,
                                                      defaultIssue: item,
                                                   })
                                                }}
                                             />,
                                             <Button
                                                key={"delete"}
                                                type={"text"}
                                                icon={<DeleteOutlined />}
                                                onClick={() => {
                                                   modal.confirm({
                                                      title: "Lưu ý",
                                                      content: "Bạn có chắc chắn muốn xóa lỗi này không",
                                                      onOk: () => {
                                                         setNewIssues((prev) => prev.filter((i) => i.id !== item.id))
                                                      },
                                                      centered: true,
                                                      maskClosable: true,
                                                      okText: "Xóa",
                                                      cancelText: "Đóng",
                                                   })
                                                }}
                                             />,
                                          ]}
                                       >
                                          <List.Item.Meta
                                             avatar={<MinusCircleFilled className={"text-neutral-300"} />}
                                             title={<div className={"line-clamp-2"}>{item.typeError.name}</div>}
                                             description={
                                                <Space split={<Divider type={"vertical"} className={"m-0"} />} wrap>
                                                   <div className={FixTypeTagMapper[item.fixType].className}>
                                                      {FixTypeTagMapper[item.fixType].text}
                                                   </div>
                                                   <div className={"line-clamp-1"}>{item.description}</div>
                                                </Space>
                                             }
                                          />
                                       </List.Item>
                                    )
                                 }}
                              />
                           )}
                        </div>
                     ),
                  },
               ]}
            />
         </Drawer>
         <OverlayControllerWithRef ref={control_issueDetailsDrawer}>
            <IssueDetailsDrawer refetchFn={() => {}} />
         </OverlayControllerWithRef>
         <Issue_SelectTypeErrorDrawer
            ref={control_issueCreateDrawer}
            onFinish={(result) => {
               console.log(result)
               setNewIssues((prev) => [...prev, result])
            }}
            returnResult={true}
         />
         <Issue_CreateDetailsDrawer
            ref={control_createIssueDetailsDrawer}
            onFinish={async (result) => {
               setNewIssues((prev) => {
                  const index = prev.findIndex((i) => i.id === result.id)
                  if (index === -1) return prev
                  prev[index] = result
                  return [...prev]
               })
            }}
            showCancel={false}
         />
      </>
   )
}

export default Task_VerifyCompleteDrawer
export type { Task_VerifyCompleteDrawerProps }
