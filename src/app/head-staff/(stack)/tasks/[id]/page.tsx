"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import HeadStaff_Task_OneById from "@/app/head-staff/_api/task/one-byId.api"
import RootHeader from "@/common/components/RootHeader"
import { DeleteOutlined, LeftOutlined, UserOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { App, Avatar, Button, Card, Collapse, Descriptions, List, Tabs, Tag, Typography } from "antd"
import CreateIssueDrawer from "@/app/head-staff/(stack)/tasks/[id]/_components/CreateIssue.drawer"
import { FixType } from "@/common/enum/fix-type.enum"
import SelectSparePartDrawer from "@/app/head-staff/(stack)/tasks/[id]/_components/SelectSparePart.drawer"
import HeadStaff_SparePart_Create from "@/app/head-staff/_api/spare-part/create.api"
import HeadStaff_SparePart_Delete from "@/app/head-staff/_api/spare-part/delete.api"
import AssignFixerDrawer from "@/app/head-staff/(stack)/tasks/[id]/_components/AssignFixer.drawer"
import HeadStaff_Task_UpdateAssignFixer from "@/app/head-staff/_api/task/update-assignFixer.api"

export default function TaskDetails({ params }: { params: { id: string } }) {
   const result = useQuery({
      queryKey: qk.task.one_byId(params.id),
      queryFn: () => HeadStaff_Task_OneById({ id: params.id }),
   })
   const router = useRouter()
   const { message } = App.useApp()

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
         await result.refetch()
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
         await result.refetch()
      },
      onSettled: () => {
         message.destroy("remove-spare-part")
      },
   })

   const mutate_assignFixer = useMutation({
      mutationFn: HeadStaff_Task_UpdateAssignFixer,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "assigning-fixer",
            content: "Assigning Fixer...",
         })
      },
      onError: async () => {
         message.error("Failed to assign fixer")
      },
      onSuccess: async () => {
         message.success("Fixer assigned")
         await result.refetch()
      },
      onSettled: () => {
         message.destroy("assigning-fixer")
      },
   })

   return (
      <div
         style={{
            display: "grid",
            gridTemplateColumns: "[outer-start] 16px [inner-start] 1fr [inner-end] 16px [outer-end] 0",
         }}
      >
         <RootHeader
            title="Task Details"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            className="p-4"
            style={{
               gridColumn: "outer-start / outer-end",
            }}
         />
         <ProDescriptions
            className="mt-3"
            bordered={true}
            style={{
               gridColumn: "inner-start / inner-end",
            }}
            dataSource={result.data}
            loading={result.isLoading}
            size="small"
            columns={[
               {
                  key: "name",
                  label: "Task Name",
                  dataIndex: "name",
               },
               {
                  key: "created",
                  label: "Created At",
                  dataIndex: "createdAt",
                  render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
               },
               {
                  key: "status",
                  label: "Status",
                  dataIndex: "status",
               },
               {
                  key: "priority",
                  label: "Priority",
                  render: (_, e) => (e.priority ? <Tag color="red">High</Tag> : <Tag color="green">Low</Tag>),
               },
               {
                  key: "totalTime",
                  label: "Total Time",
                  dataIndex: "totalTime",
               },
               {
                  key: "operator",
                  label: "Operator",
                  dataIndex: "operator",
               },
            ]}
         />
         <Tabs
            className="mt-3"
            style={{
               gridColumn: "inner-start / inner-end",
            }}
            items={[
               {
                  key: "machine",
                  label: "Device",
                  children: (
                     <ProDescriptions
                        dataSource={result.data?.device}
                        loading={result.isLoading}
                        size="small"
                        columns={[
                           {
                              key: "machineModel",
                              label: "Machine Model",
                              render: (_, e) => e.machineModel?.name ?? "-",
                           },
                           {
                              key: "position",
                              label: "Position",
                              render: (_, e) => `${e.area?.name ?? "-"} - (${e.positionX} : ${e.positionY})`,
                           },
                           {
                              key: "description",
                              label: "Description",
                              dataIndex: "description",
                           },
                        ]}
                     />
                  ),
               },
               {
                  key: "issues",
                  label: "Issues",
                  children: (
                     <div>
                        <Collapse
                           expandIconPosition="end"
                           items={result.data?.issues.map((item) => ({
                              key: item.id,
                              label: (
                                 <div>
                                    <Tag color={item.fixType === FixType.REPAIR ? "red" : "blue"}>{item.fixType}</Tag>
                                    <Typography.Text className="w-40">{item.typeError.name}</Typography.Text>
                                 </div>
                              ),
                              children: (
                                 <div>
                                    <Descriptions
                                       size="small"
                                       items={[
                                          {
                                             label: "Description",
                                             children: item.description,
                                          },
                                       ]}
                                    />
                                    <Descriptions
                                       size="small"
                                       layout="vertical"
                                       items={[
                                          {
                                             label: "Spare Parts",
                                             span: 10,
                                             contentStyle: {
                                                width: "100%",
                                             },
                                             children: (
                                                <SelectSparePartDrawer
                                                   onFinish={(values) => {
                                                      mutate_addSparePart.mutate({
                                                         issue: item.id,
                                                         sparePart: values.sparePartId,
                                                         quantity: values.quantity,
                                                      })
                                                   }}
                                                >
                                                   {(handleOpen) => (
                                                      <div className="w-full">
                                                         <List
                                                            className={"w-full"}
                                                            dataSource={item.issueSpareParts}
                                                            extra={<Button>Hi</Button>}
                                                            itemLayout={"horizontal"}
                                                            renderItem={(sp) => (
                                                               <List.Item
                                                                  itemID={sp.id}
                                                                  key={sp.id}
                                                                  extra={
                                                                     <Button
                                                                        danger
                                                                        type="text"
                                                                        size={"small"}
                                                                        icon={<DeleteOutlined />}
                                                                        onClick={() => {
                                                                           mutate_deleteSparePart.mutate({
                                                                              id: sp.id,
                                                                           })
                                                                        }}
                                                                     ></Button>
                                                                  }
                                                               >
                                                                  <List.Item.Meta
                                                                     title={sp.name}
                                                                     description={sp.quantity}
                                                                  ></List.Item.Meta>
                                                               </List.Item>
                                                            )}
                                                         />
                                                         <Button
                                                            className="w-full"
                                                            type="dashed"
                                                            size="large"
                                                            onClick={() =>
                                                               result.isSuccess && handleOpen(result.data.device.id)
                                                            }
                                                         >
                                                            Add Spare Part
                                                         </Button>
                                                      </div>
                                                   )}
                                                </SelectSparePartDrawer>
                                             ),
                                          },
                                       ]}
                                    />
                                 </div>
                              ),
                           }))}
                        />
                        <CreateIssueDrawer>
                           {(handleOpen) => (
                              <Button type="dashed" className="my-3 h-14 w-full" onClick={() => handleOpen(params.id)}>
                                 Add Issue
                              </Button>
                           )}
                        </CreateIssueDrawer>
                     </div>
                  ),
               },
               {
                  key: "assign_fixer",
                  label: "Fixer",
                  children: (
                     <div>
                        {result.isSuccess && result.data.fixer !== null ? (
                           <Card
                              size="small"
                              classNames={{
                                 body: "flex",
                              }}
                           >
                              <Avatar icon={<UserOutlined />} />
                              <div className="ml-3">
                                 <div className="text-base font-semibold">{result.data.fixer.username}</div>
                                 <div className="text-xs">{result.data.fixer.phone}</div>
                              </div>
                           </Card>
                        ) : (
                           <>
                              <Card size="small">
                                 By assigning a fixer, this task will be automatically moved to <Tag>PENDING</Tag>status
                              </Card>
                              <AssignFixerDrawer
                                 onFinish={(fixerId) => {
                                    mutate_assignFixer.mutate({
                                       id: params.id,
                                       payload: {
                                          fixer: fixerId,
                                       },
                                    })
                                 }}
                              >
                                 {(handleOpen) => (
                                    <Button type="dashed" className="mt-3 w-full" onClick={handleOpen}>
                                       Add Fixer
                                    </Button>
                                 )}
                              </AssignFixerDrawer>
                           </>
                        )}
                     </div>
                  ),
               },
            ]}
         />
      </div>
   )
}
