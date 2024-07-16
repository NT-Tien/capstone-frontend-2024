import { ReactNode, useState } from "react"
import { App, Button, Drawer, Popconfirm } from "antd"
import { ProDescriptions } from "@ant-design/pro-components"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import dayjs from "dayjs"
import ProList from "@ant-design/pro-list/lib"
import SelectSparePartDrawer from "@/app/head-staff/_components/SelectSparePart.drawer"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import HeadStaff_SparePart_Create from "@/app/head-staff/_api/spare-part/create.api"
import { cn } from "@/common/util/cn.util"
import ProCard from "@ant-design/pro-card"
import { DeleteOutlined } from "@ant-design/icons"
import HeadStaff_SparePart_Delete from "@/app/head-staff/_api/spare-part/delete.api"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Issue_OneById from "@/app/head-staff/_api/issue/oneById.api"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"

export default function IssueDetailsDrawer({
   children,
   refetch,
   showActions = true,
}: {
   children: (handleOpen: (issueId: string, deviceId: string) => void) => ReactNode
   refetch: () => void
   showActions?: boolean
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

   const mutate_addSparePart = useMutation({
      mutationFn: HeadStaff_SparePart_Create,
      onMutate: async () => {
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
         refetch()
      },
      onSettled: () => {
         message.destroy("creating-spare-part")
      },
   })

   const mutate_deleteSparePart = useMutation({
      mutationFn: HeadStaff_SparePart_Delete,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "remove-spare-part",
            content: "Removing Spare Part...",
         })
      },
      onError: async () => {
         message.error("Failed to remove spare part")
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
         <Drawer open={open} onClose={handleClose} title="Issue Details">
            <ProDescriptions<FixRequestIssueDto>
               title="Issue Details"
               dataSource={issue.data}
               loading={issue.isPending}
               column={1}
               columns={[
                  {
                     title: "Error Name",
                     dataIndex: ["typeError", "name"],
                  },
                  {
                     title: "Description",
                     dataIndex: ["description"],
                  },
                  {
                     title: "Fix Type",
                     dataIndex: ["fixType"],
                  },
                  {
                     title: "Duration",
                     dataIndex: ["typeError", "duration"],
                  },
                  {
                     title: "Status",
                     dataIndex: ["status"],
                  },
                  {
                     title: "Created At",
                     dataIndex: ["createdAt"],
                     render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY HH:mm"),
                  },
                  {
                     title: "Updated At",
                     dataIndex: ["updatedAt"],
                     render: (_, e) => dayjs(e.updatedAt).format("DD/MM/YYYY HH:mm"),
                  },
               ]}
            />
            <ProList
               headerTitle={<span className="font-semibold">Spare Parts</span>}
               className={"list-no-padding mt-6"}
               dataSource={issue.data?.issueSpareParts}
               renderItem={(item) => {
                  return (
                     <ProCard size="small" className={cn("mb-2 p-2")} bordered>
                        <div className="flex items-center">
                           <div className="flex flex-grow flex-col">
                              <span className="text-sub-base font-medium">{item.sparePart.name}</span>
                              <span className="text-sub-base">Qty: {item.quantity}</span>
                           </div>
                           {showActions && (
                              <Popconfirm
                                 title={"Are you sure?"}
                                 onConfirm={() => {
                                    mutate_deleteSparePart.mutate({ id: item.id })
                                 }}
                              >
                                 <Button type="link" danger icon={<DeleteOutlined />}>
                                    Remove
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
                     placement: "right",
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
                        type="primary"
                        size="large"
                        onClick={() =>
                           handleOpen1(
                              device.data?.id ?? "",
                              issue.data?.issueSpareParts.flatMap((v) => v.sparePart.id),
                           )
                        }
                     >
                        Add Spare Part
                     </Button>
                  )}
               </SelectSparePartDrawer>
            )}
         </Drawer>
      </>
   )
}
