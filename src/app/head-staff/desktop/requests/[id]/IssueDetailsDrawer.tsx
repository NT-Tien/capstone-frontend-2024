import { ReactNode, useState } from "react"
import { App, Button, Drawer, DrawerProps, Dropdown, Popconfirm, Tag } from "antd"
import { ProDescriptions } from "@ant-design/pro-components"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import dayjs from "dayjs"
import ProList from "@ant-design/pro-list/lib"
import SelectSparePartDrawer from "@/app/head-staff/_components/SelectSparePart.drawer"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import HeadStaff_SparePart_Create from "@/app/head-staff/_api/spare-part/create.api"
import { cn } from "@/common/util/cn.util"
import ProCard from "@ant-design/pro-card"
import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons"
import HeadStaff_SparePart_Delete from "@/app/head-staff/_api/spare-part/delete.api"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Issue_OneById from "@/app/head-staff/_api/issue/oneById.api"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import HeadStaff_Issue_Delete from "@/app/head-staff/_api/issue/delete.api"
import { FixRequestStatusTagMapper } from "@/common/enum/issue-request-status.enum"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import HeadStaff_Issue_Update from "@/app/head-staff/_api/issue/update.api"

export default function IssueDetailsDrawer({
   children,
   refetch,
   showActions = true,
   drawerProps,
}: {
   children: (handleOpen: (issueId: string, deviceId: string) => void) => ReactNode
   refetch: () => void
   showActions?: boolean
   drawerProps?: DrawerProps
}) {
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const [open, setOpen] = useState(false)
   const [issueId, setIssueId] = useState<undefined | string>()
   const [deviceId, setDeviceId] = useState<undefined | string>()

   const issue = useQuery({
      queryKey: headstaff_qk.issue.byId(issueId ?? ""),
      queryFn: () => HeadStaff_Issue_OneById({ id: issueId ?? "" }),
      enabled: !!issueId,
   })

   const device = useQuery({
      queryKey: headstaff_qk.device.byId(deviceId ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: deviceId ?? "" }),
      enabled: !!deviceId,
   })

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
         message.error("Cập nhật vấn đề thất bại")
      },
      onSuccess: async () => {
         message.success("Issue updated")
         await issue.refetch()
         refetch()
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
         message.error("Xóa vấn đề thất bại")
      },
      onSuccess: async () => {
         message.success("Issue removed")
         refetch()
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
         message.error("Thêm linh kiện thất bại")
      },
      onSuccess: async () => {
         message.success("Thêm linh kiện thành công")
         await issue.refetch()
         refetch()
      },
      onSettled: () => {
         message.destroy("creating-spare-part")
      },
   })

   const mutate_deleteSparePart = useMutation({
      mutationFn: HeadStaff_SparePart_Delete,
      onMutate: async () => {
         message.destroy("remove-spare-part")
         message.open({
            type: "loading",
            key: "remove-spare-part",
            content: "Removing Spare Part...",
         })
      },
      onError: async () => {
         message.error("Xóa linh kiện thất bại")
      },
      onSuccess: async () => {
         message.success("Spare part removed")
         await issue.refetch()
         refetch()
      },
      onSettled: () => {
         message.destroy("remove-spare-part")
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

   function handleOpen(issueId: string, deviceId: string) {
      setOpen(true)
      setIssueId(issueId)
      setDeviceId(deviceId)
   }

   function handleClose() {
      setOpen(false)
      setIssueId(undefined)
      setDeviceId(undefined)
      queryClient
         .invalidateQueries({
            queryKey: headstaff_qk.issue.byId(issueId ?? ""),
         })
         .then()
      queryClient
         .invalidateQueries({
            queryKey: headstaff_qk.device.byId(deviceId ?? ""),
         })
         .then()
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} title="Thông tin chi tiết" {...drawerProps}>
            <ProDescriptions<FixRequestIssueDto>
               title={
                  <div className="flex items-center gap-2">
                     <span>Chi tiết vấn đề</span>
                     <Tag color={FixRequestStatusTagMapper[String(issue.data?.status)].colorInverse}>
                        {FixRequestStatusTagMapper[String(issue.data?.status)].text}
                     </Tag>
                  </div>
               }
               dataSource={issue.data}
               loading={issue.isPending}
               editable={{
                  type: "multiple",
                  onSave: async (key, record, originRow, newLineConfig) => {
                     console.log(record)
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
                     <Dropdown
                        menu={{
                           items: [
                              {
                                 key: "delete",
                                 label: "Xóa",
                                 icon: <DeleteOutlined />,
                                 danger: true,
                                 onClick: () => issueId && handleDeleteIssue(issueId),
                              },
                           ],
                        }}
                     >
                        <Button icon={<MoreOutlined />} type="primary" size="small">
                           Hoạt động
                        </Button>
                     </Dropdown>
                  )
               }
               columns={[
                  {
                     title: "Tên lỗi",
                     dataIndex: ["typeError", "name"],
                     valueType: "select",
                     editable: showActions === false ? false : undefined,
                     valueEnum: device.data?.machineModel.typeErrors.reduce((acc, v) => {
                        acc[v.id] = { text: v.name }
                        return acc
                     }, {} as any),
                     fieldProps: {
                        showSearch: true,
                     },
                  },
                  {
                     title: "Mô tả",
                     dataIndex: ["description"],
                     valueType: "textarea",
                     editable: showActions === false ? false : undefined,
                  },
                  {
                     title: "Cách sửa chữa",
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
                     title: "Thời lượng",
                     dataIndex: ["typeError", "duration"],
                     editable: false,
                  },
                  {
                     title: "Trạng thái",
                     dataIndex: ["status"],
                     editable: false,
                  },
                  {
                     title: "Ngày tạo",
                     dataIndex: ["createdAt"],
                     editable: false,
                     render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY HH:mm"),
                  },
                  {
                     title: "Ngày cập nhật",
                     dataIndex: ["updatedAt"],
                     editable: false,
                     render: (_, e) => dayjs(e.updatedAt).format("DD/MM/YYYY HH:mm"),
                  },
               ]}
            />
            <ProList
               headerTitle={<span className="font-semibold">Linh kiện thay thế</span>}
               className={"list-no-padding mt-6"}
               dataSource={issue.data?.issueSpareParts}
               renderItem={(item) => {
                  return (
                     <ProCard size="small" className={cn("mb-2 p-2")} bordered>
                        <div className="flex items-center">
                           <div className="flex flex-grow flex-col">
                              <span className="text-sub-base font-medium">{item.sparePart.name}</span>
                              <span className="text-sub-base">Số lượng: {item.quantity}</span>
                           </div>
                           {showActions && (
                              <Popconfirm
                                 title={"Are you sure?"}
                                 onConfirm={() => {
                                    mutate_deleteSparePart.mutate({ id: item.id })
                                 }}
                              >
                                 <Button type="link" danger icon={<DeleteOutlined />}>
                                    Xóa
                                 </Button>
                              </Popconfirm>
                           )}
                        </div>
                     </ProCard>
                  )
               }}
            />
            {showActions && (
               <SelectSparePartDrawer
                  drawerProps={{
                     placement: "bottom",
                     height: "100%",
                  }}
                  onFinish={(values) => {
                     if (!issueId) return

                     mutate_addSparePart.mutate(
                        {
                           issue: issueId,
                           sparePart: values.sparePartId,
                           quantity: values.quantity,
                        },
                        {
                           onSuccess: async () => {
                              await issue.refetch()
                           },
                        },
                     )
                  }}
               >
                  {(handleOpen1) => (
                     <Button
                        className="w-full"
                        type="default"
                        size="large"
                        onClick={() =>
                           handleOpen1(
                              device.data?.id ?? "",
                              issue.data?.issueSpareParts.flatMap((v) => v.sparePart.id),
                           )
                        }
                     >
                        Thêm linh kiện
                     </Button>
                  )}
               </SelectSparePartDrawer>
            )}
         </Drawer>
      </>
   )
}
