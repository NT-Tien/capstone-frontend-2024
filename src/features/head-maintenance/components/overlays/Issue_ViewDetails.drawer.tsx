import HeadStaff_Device_OneById from "@/features/head-maintenance/api/device/one-byId.api"
import HeadStaff_Issue_Delete from "@/features/head-maintenance/api/issue/delete.api"
import HeadStaff_Issue_OneById from "@/features/head-maintenance/api/issue/oneById.api"
import HeadStaff_Issue_Update from "@/features/head-maintenance/api/issue/update.api"
import headstaff_qk from "@/features/head-maintenance/qk"
import HeadStaff_IssueSparePart_Create from "@/features/head-maintenance/api/spare-part/create.api"
import IssueSparePartDetailsModal from "@/features/head-maintenance/components/overlays/IssueSparePartDetailsModal"
import SelectSparePartDrawer from "@/features/head-maintenance/components/overlays/SelectSparePart.drawer"
import ModalConfirm from "@/old/ModalConfirm"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { Issue_StatusMapper } from "@/lib/domain/Issue/IssueStatus.mapper"
import { FixType, FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import useModalControls from "@/lib/hooks/useModalControls"
import { cn } from "@/lib/utils/cn.util"
import { clientEnv } from "@/env"
import { ArrowRightOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import ProList from "@ant-design/pro-list/lib"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Badge, Button, Card, Drawer, DrawerProps, Empty, Image, Tag } from "antd"
import dayjs from "dayjs"
import Link from "next/link"
import { forwardRef, ReactNode, useImperativeHandle, useMemo, useRef, useState } from "react"
import hm_uris from "@/features/head-maintenance/uri"

export type IssueDetailsDrawerRefType = {
   openDrawer: (issueId: string, deviceId: string, showActions?: boolean) => void
}

type Props = {
   children?: (handleOpen: (issueId: string, deviceId: string, showActions?: boolean) => void) => ReactNode
   showActions?: boolean
   showIssueStatus?: boolean
   drawerProps?: DrawerProps
   refetch: () => void
}

const Issue_ViewDetailsDrawer = forwardRef<IssueDetailsDrawerRefType, Props>(function Component(
   { children, showIssueStatus = false, drawerProps, refetch },
   ref,
) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (issueId: string, deviceId: string, showActions: boolean = true) => {
         setIssueId(issueId)
         setDeviceId(deviceId)
         setShowActions(showActions)
      },
      onClose: () => {
         setTimeout(() => {
            setIssueId(undefined)
            setDeviceId(undefined)
            setShowActions(true)
         }, 300)
      },
   })
   const { message } = App.useApp()

   const [showActions, setShowActions] = useState<boolean>(true)
   const [issueId, setIssueId] = useState<undefined | string>()
   const [deviceId, setDeviceId] = useState<undefined | string>()
   const [highlightedId, setHighlightedId] = useState<undefined | string>()
   const highlightedTimeoutRef = useRef<NodeJS.Timeout | null>(null)

   const issue = useQuery({
      queryKey: headstaff_qk.issue.byId(issueId ?? ""),
      queryFn: () => HeadStaff_Issue_OneById({ id: issueId ?? "" }),
      enabled: !!issueId,
   })
   const device = useQuery({
      queryKey: headstaff_qk.device.byId(deviceId ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: deviceId ?? "" }),
      enabled: !!deviceId,
      staleTime: Infinity,
   })

   const sortedIssueSparePartsByCreatedDate = useMemo(() => {
      return issue.data?.issueSpareParts.sort((a, b) => {
         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
   }, [issue.data])

   const mutate_updateIssue = useMutation({
      mutationFn: HeadStaff_Issue_Update,
      onMutate: async () => {
         message.destroy("update-issue")
         message.open({
            type: "loading",
            key: "update-issue",
            content: "Vui lòng chờ đợi...",
         })
      },
      onError: async () => {
         message.error("Cập nhật thất bại")
      },
      onSuccess: async () => {
         message.success("Cập nhật thành công")
         await issue.refetch()
      },
      onSettled: () => {
         message.destroy("update-issue")
      },
   })
   const mutate_deleteIssue = useMutation({
      mutationFn: HeadStaff_Issue_Delete,
      onMutate: async () => {
         message.destroy("remove")
         message.open({
            type: "loading",
            key: "remove",
            content: "Vui lòng chờ đợi...",
         })
      },
      onError: async () => {
         message.error("Xóa thất bại")
      },
      onSuccess: async () => {
         message.success("Xóa thành công")
      },
      onSettled: () => {
         message.destroy("remove")
      },
   })
   const mutate_addSparePart = useMutation({
      mutationFn: HeadStaff_IssueSparePart_Create,
      onMutate: async () => {
         message.destroy("creating-spare-part")
         message.open({
            type: "loading",
            key: "creating-spare-part",
            content: "Vui lòng chờ đợi...",
         })
      },
      onError: async () => {
         message.error("Thêm linh kiện thất bại")
      },
      onSuccess: async () => {
         message.success("Thêm linh kiện thành công")
         await issue.refetch()
      },
      onSettled: () => {
         message.destroy("creating-spare-part")
      },
   })

   function handleDeleteIssue(issueId: string) {
      mutate_deleteIssue.mutate(
         {
            id: issueId,
         },
         {
            onSuccess: async () => {
               handleClose()
               refetch()
            },
         },
      )
   }

   function handleCreateSparePart(sparePartId: string, quantity: number) {
      if (!issueId) return

      mutate_addSparePart.mutate(
         {
            issue: issueId,
            sparePart: sparePartId,
            quantity: quantity,
         },
         {
            onSuccess: async (res) => {
               await issue.refetch().then()
               refetch()

               clearTimeout(highlightedTimeoutRef.current ?? 0)
               setHighlightedId(res.id)
               highlightedTimeoutRef.current = setTimeout(() => {
                  setHighlightedId(undefined)
               }, 5000)
            },
         },
      )
   }

   function IssueSparePartRibbon({ children, ...rest }: { children: ReactNode; id: string }) {
      if (rest.id === highlightedId) {
         return (
            <Badge.Ribbon text="Mới" color="green">
               {children}
            </Badge.Ribbon>
         )
      }
      return children
   }

   useImperativeHandle(
      ref,
      () => ({
         openDrawer: handleOpen,
      }),
      [handleOpen],
   )

   return (
      <>
         {children?.(handleOpen)}
         <Drawer open={open} onClose={handleClose} title="Thông tin lỗi" {...drawerProps}>
            <ProDescriptions<IssueDto>
               title={
                  <div className="flex items-center gap-2">
                     <span>Thông tin</span>
                     {showIssueStatus && (
                        <Tag color={Issue_StatusMapper(issue.data).colorInverse}>
                           {Issue_StatusMapper(issue.data).text}
                        </Tag>
                     )}
                  </div>
               }
               dataSource={issue.data}
               loading={issue.isPending}
               editable={{
                  type: "multiple",
                  onSave: async (key, record, originRow, newLineConfig) => {
                     mutate_updateIssue.mutate({
                        id: record.id,
                        payload: {
                           description: record.description,
                           typeError: record.typeError.id,
                           fixType: record.fixType,
                        },
                     })
                  },
               }}
               size="small"
               column={1}
               extra={
                  showActions && (
                     <ModalConfirm
                        onConfirm={() => issueId && handleDeleteIssue(issueId)}
                        confirmText="Xóa"
                        confirmProps={{ danger: true }}
                        title="Lưu ý"
                        description="Bạn có chắc chắn muốn xóa vấn đề này?"
                     >
                        <Button icon={<DeleteOutlined />} type="primary" size="small" danger>
                           Xóa
                        </Button>
                     </ModalConfirm>
                  )
               }
               columns={[
                  {
                     title: "Tên lỗi",
                     dataIndex: ["typeError", "name"],
                     valueType: "select",
                     editable: false,
                     // editable: showActions === false ? false : undefined,
                     // valueEnum: device.data?.machineModel.typeErrors.reduce((acc, v) => {
                     //    acc[v.id] = { text: v.name }
                     //    return acc
                     // }, {} as any),
                     // fieldProps: {
                     //    showSearch: true,
                     // },
                  },
                  {
                     title: "Loại sửa chữa",
                     dataIndex: ["fixType"],
                     valueType: "radioButton",
                     editable: showActions === false ? false : undefined,
                     render: (_, e) => (
                        <Tag color={FixTypeTagMapper[String(e.fixType)].colorInverse}>
                           {FixTypeTagMapper[String(e.fixType)].text}
                        </Tag>
                     ),
                     valueEnum: Object.values(FixType).reduce((acc, v) => {
                        acc[v] = { text: v }
                        return acc
                     }, {} as any),
                     fieldProps: {
                        variant: "filled",
                     },
                  },
                  {
                     title: "Thời gian sửa chữa",
                     dataIndex: ["typeError", "duration"],
                     editable: false,
                     render: (_, e) => `${e.typeError.duration} minutes`,
                  },
                  {
                     title: "Mô tả",
                     dataIndex: ["description"],
                     valueType: "textarea",
                     editable: showActions === false ? false : undefined,
                     formItemProps: {
                        className: "w-full *:w-full",
                     },
                     className: "descriptions-description",

                     fieldProps: {
                        rows: 6,
                        maxLength: 300,
                        max: 300,
                        showCount: true,
                     },
                  },
                  {
                     title: "Tác vụ được giao",
                     dataIndex: ["task", "id"],
                     render: (_, e) =>
                        e.task === null ? (
                           "Chưa có"
                        ) : (
                           <Link href={hm_uris.stack.tasks_id(e.task.id)} className="truncate">
                              {e.task.name}
                           </Link>
                        ),
                     editable: false,
                  },
                  {
                     title: "Ngày tạo",
                     dataIndex: ["createdAt"],
                     editable: false,
                     render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("DD/MM/YYYY HH:mm"),
                  },
                  {
                     title: "Ngày cập nhật",
                     dataIndex: ["updatedAt"],
                     editable: false,
                     render: (_, e) =>
                        e.createdAt === e.updatedAt
                           ? "-"
                           : dayjs(e.updatedAt).add(7, "hours").format("DD/MM/YYYY HH:mm"),
                  },
               ]}
            />

            {issue.data?.status === IssueStatusEnum.RESOLVED &&
               (issue.data.videosVerify || issue.data.imagesVerify.find((img) => !!img)) && (
                  <Card size="small" className="my-layout">
                     <section>
                        <h2 className="mb-2 text-sub-base font-medium">Hình ảnh minh chứng</h2>
                        {issue.data.imagesVerify.find((img) => !!img) ? (
                           <div className="flex items-center gap-3">
                              {issue.data.imagesVerify.map((img) => (
                                 <Image
                                    key={img}
                                    src={clientEnv.BACKEND_URL + `/file-image/${img}`}
                                    alt="image"
                                    className="h-20 w-20 rounded-lg"
                                 />
                              ))}
                           </div>
                        ) : (
                           <div className="grid h-20 w-full place-content-center rounded-lg bg-neutral-100">
                              Không có
                           </div>
                        )}
                     </section>
                     <section className="mt-4">
                        <h2 className="mb-2 text-sub-base font-medium">Video minh chứng</h2>
                        {issue.isSuccess ? (
                           !!issue.data.videosVerify ? (
                              <video width="100%" height="240" controls>
                                 <source
                                    src={clientEnv.BACKEND_URL + `/file-video/${issue.data.videosVerify}`}
                                    type="video/mp4"
                                 />
                              </video>
                           ) : (
                              <div className="grid h-20 w-full place-content-center rounded-lg bg-neutral-100">
                                 Không có
                              </div>
                           )
                        ) : null}
                     </section>
                  </Card>
               )}

            <section className="mb-3 mt-layout">
               <header className="mb-2 mt-2 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Linh kiện ({issue.data?.issueSpareParts.length ?? 0})</h2>
                  {showActions && (
                     <SelectSparePartDrawer
                        drawerProps={{
                           placement: "bottom",
                           height: "100%",
                        }}
                        onFinish={async (values) => handleCreateSparePart(values.sparePartId, values.quantity)}
                     >
                        {(handleOpen1) => (
                           <Button
                              className=""
                              type="primary"
                              size="middle"
                              icon={<PlusOutlined />}
                              onClick={() =>
                                 handleOpen1(
                                    device.data?.id ?? "",
                                    issue.data?.issueSpareParts.flatMap((v) => v.sparePart.id),
                                 )
                              }
                           >
                              Thêm mới
                           </Button>
                        )}
                     </SelectSparePartDrawer>
                  )}
               </header>
               {issue.data?.issueSpareParts.length === 0 ? (
                  <Card>
                     <Empty description="Chưa có linh kiện" />
                  </Card>
               ) : (
                  <IssueSparePartDetailsModal refetch={issue.refetch} showActions={showActions}>
                     {(handleOpen1) => (
                        <ProList
                           className={"list-no-padding"}
                           dataSource={sortedIssueSparePartsByCreatedDate}
                           renderItem={(item) => {
                              return (
                                 <IssueSparePartRibbon id={item.id}>
                                    <Card
                                       size="small"
                                       className={cn(
                                          "mb-2",
                                          item.id === highlightedId && "border-green-200 bg-green-50",
                                          item.quantity > item.sparePart.quantity && "border-yellow-100 bg-yellow-50",
                                       )}
                                       bordered
                                       hoverable={true}
                                       onClick={() => handleOpen1(item)}
                                    >
                                       <div className="flex flex-col">
                                          <div className="flex justify-between">
                                             <span className="text-sub-base font-medium">{item.sparePart.name}</span>
                                             {item.quantity > item.sparePart.quantity && (
                                                <Tag color="gold-inverse">Hết hàng</Tag>
                                             )}
                                          </div>
                                          <div className="mt-2 flex items-center">
                                             <span className="flex-grow text-sub-base text-neutral-500">
                                                Quantity: {item.quantity}
                                             </span>
                                             <Button size="small" icon={<ArrowRightOutlined />} type="text"></Button>
                                          </div>
                                       </div>
                                    </Card>
                                 </IssueSparePartRibbon>
                              )
                           }}
                        />
                     )}
                  </IssueSparePartDetailsModal>
               )}
            </section>
         </Drawer>
      </>
   )
})

export default Issue_ViewDetailsDrawer
