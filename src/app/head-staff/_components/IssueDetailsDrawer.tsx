import React, { ReactNode, useMemo, useRef, useState } from "react"
import { App, Badge, Button, Card, Drawer, DrawerProps, Empty, Tag } from "antd"
import { ProDescriptions } from "@ant-design/pro-components"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import dayjs from "dayjs"
import ProList from "@ant-design/pro-list/lib"
import SelectSparePartDrawer from "@/app/head-staff/_components/SelectSparePart.drawer"
import { useMutation, useQuery } from "@tanstack/react-query"
import HeadStaff_SparePart_Create from "@/app/head-staff/_api/spare-part/create.api"
import { cn } from "@/common/util/cn.util"
import ProCard from "@ant-design/pro-card"
import { ArrowRightOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Issue_OneById from "@/app/head-staff/_api/issue/oneById.api"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import HeadStaff_Issue_Delete from "@/app/head-staff/_api/issue/delete.api"
import { FixRequestStatusTagMapper } from "@/common/enum/fix-request-status.enum"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import HeadStaff_Issue_Update from "@/app/head-staff/_api/issue/update.api"
import ModalConfirm from "@/common/components/ModalConfirm"
import IssueSparePartDetailsModal from "@/app/head-staff/_components/IssueSparePartDetailsModal"
import useModalControls from "@/common/hooks/useModalControls"

export default function IssueDetailsDrawer({
   children,
   showActions = true,
   showIssueStatus = false,
   drawerProps,
   refetch,
}: {
   children: (handleOpen: (issueId: string, deviceId: string) => void) => ReactNode
   showActions?: boolean
   showIssueStatus?: boolean
   drawerProps?: DrawerProps
   refetch: () => void
}) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (issueId: string, deviceId: string) => {
         setIssueId(issueId)
         setDeviceId(deviceId)
      },
      onClose: () => {
         setTimeout(() => {
            setIssueId(undefined)
            setDeviceId(undefined)
         }, 300)
      },
   })
   const { message } = App.useApp()

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
            content: "Updating Issue...",
         })
      },
      onError: async () => {
         message.error("Failed to update issue")
      },
      onSuccess: async () => {
         message.success("Issue updated")
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
            content: "Removing Issue...",
         })
      },
      onError: async () => {
         message.error("Failed to remove issue")
      },
      onSuccess: async () => {
         message.success("Issue removed")
      },
      onSettled: () => {
         message.destroy("remove")
      },
   })
   const mutate_addSparePart = useMutation({
      mutationFn: HeadStaff_SparePart_Create,
      onMutate: async () => {
         message.destroy("creating-spare-part")
         message.open({
            type: "loading",
            key: "creating-spare-part",
            content: "Adding Spare Part...",
         })
      },
      onError: async () => {
         message.error("Failed to add spare part")
      },
      onSuccess: async () => {
         message.success("Spare part added")
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
               await issue.refetch()

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
            <Badge.Ribbon text="New" color="green">
               {children}
            </Badge.Ribbon>
         )
      }
      return children
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} title="Issue Details" {...drawerProps}>
            <ProDescriptions<FixRequestIssueDto>
               title={
                  <div className="flex items-center gap-2">
                     <span>Issue Details</span>
                     {showIssueStatus && (
                        <Tag color={FixRequestStatusTagMapper[String(issue.data?.status)].colorInverse}>
                           {FixRequestStatusTagMapper[String(issue.data?.status)].text}
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
                        confirmText="Delete"
                        confirmProps={{ danger: true }}
                        title="Warning"
                        description="Are you sure you want to delete this issue?"
                        closeAfterConfirm
                     >
                        <Button icon={<DeleteOutlined />} type="primary" size="small" danger>
                           Delete
                        </Button>
                     </ModalConfirm>
                  )
               }
               columns={[
                  {
                     title: "Error Name",
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
                     title: "Fix Type",
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
                     title: "Duration",
                     dataIndex: ["typeError", "duration"],
                     editable: false,
                     render: (_, e) => `${e.typeError.duration} minutes`,
                  },
                  {
                     title: "Description",
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
                     title: "Created At",
                     dataIndex: ["createdAt"],
                     editable: false,
                     render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("DD/MM/YYYY HH:mm"),
                  },
                  {
                     title: "Updated At",
                     dataIndex: ["updatedAt"],
                     editable: false,
                     render: (_, e) =>
                        e.createdAt === e.updatedAt ? "-" : dayjs(e.updatedAt).add(7, "hours").format("DD/MM/YYYY HH:mm"),
                  },
               ]}
            />
            <section className="mb-3 mt-layout">
               <header className="mb-2 mt-2 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Spare Parts ({issue.data?.issueSpareParts.length ?? 0})</h2>
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
                              Add New
                           </Button>
                        )}
                     </SelectSparePartDrawer>
                  )}
               </header>
               {issue.data?.issueSpareParts.length === 0 ? (
                  <Card>
                     <Empty description="No Spare Parts selected" />
                  </Card>
               ) : (
                  <IssueSparePartDetailsModal refetch={issue.refetch}>
                     {(handleOpen1) => (
                        <ProList
                           className={"list-no-padding"}
                           dataSource={sortedIssueSparePartsByCreatedDate}
                           renderItem={(item) => {
                              return (
                                 <IssueSparePartRibbon id={item.id}>
                                    <ProCard
                                       size="small"
                                       className={cn(
                                          "mb-2 p-2",
                                          item.id === highlightedId && "border-green-200 bg-green-50",
                                       )}
                                       bordered
                                       hoverable={showActions}
                                       onClick={() => showActions && handleOpen1(item)}
                                    >
                                       <div className="flex flex-col">
                                          <span className="text-sub-base font-medium">{item.sparePart.name}</span>
                                          <div className="flex items-center">
                                             <span className="flex-grow text-sub-base text-neutral-500">
                                                Quantity: {item.quantity}
                                             </span>
                                             <Button size="small" icon={<ArrowRightOutlined />} type="text"></Button>
                                          </div>
                                       </div>
                                    </ProCard>
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
}
