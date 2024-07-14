"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import { App, Avatar, Button, Card, Dropdown, Flex, Space, Table, Tag, Tooltip } from "antd"
import { useRouter } from "next/navigation"
import { FooterToolbar, PageContainer } from "@ant-design/pro-layout"
import { DeleteOutlined, LeftOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons"
import { EditableProTable, ProDescriptions, ProTable } from "@ant-design/pro-components"
import dayjs from "dayjs"
import ProList from "@ant-design/pro-list/lib"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { Key, useState } from "react"
import { FixType } from "@/common/enum/fix-type.enum"
import extended_dayjs from "@/config/dayjs.config"
import CreateIssueDrawer from "@/app/head-staff/_components/CreateIssue.drawer"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import HeadStaff_Issue_Delete from "@/app/head-staff/_api/issue/delete.api"
import HeadStaff_Issue_Update from "@/app/head-staff/_api/issue/update.api"

const fixTypeColors = {
   [FixType.REPAIR]: "red",
   [FixType.REPLACE]: "blue",
}

export default function RequestDetails({ params }: { params: { id: string } }) {
   const { message } = App.useApp()
   const router = useRouter()

   const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
   const [editableKeys, setEditableRowKeys] = useState<Key[]>([])

   const api = useQuery({
      queryKey: headstaff_qk.request.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
   })

   const device = useQuery({
      queryKey: headstaff_qk.device.byId(api.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: api.data?.device.id ?? "" }),
      enabled: api.isSuccess,
   })

   const mutate_deleteIssue = useMutation({
      mutationFn: HeadStaff_Issue_Delete,
      onMutate: async (req) => {
         message.destroy(`delete-issue-${req.id}`)
         message.open({
            type: "loading",
            content: "Deleting issue...",
            key: `delete-issue-${req.id}`,
         })
      },
      onError: async () => {
         message.error({
            content: "Failed to delete issue. See logs.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: "Issue deleted successfully.",
         })
         await api.refetch()
      },
      onSettled: (_, __, req) => {
         message.destroy(`delete-issue-${req.id}`)
      },
   })

   const mutate_updateIssue = useMutation({
      mutationFn: HeadStaff_Issue_Update,
      onMutate: async (req) => {
         message.destroy(`update-issue-${req.id}`)
         message.open({
            type: "loading",
            content: "Updating issue...",
            key: `update-issue-${req.id}`,
         })
      },
      onError: async () => {
         message.error({
            content: "Failed to update issue. See logs.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: "Issue updated successfully.",
         })
         await api.refetch()
      },
      onSettled: (_, __, req) => {
         message.destroy(`update-issue-${req.id}`)
      },
   })

   return (
      <PageContainer
         footer={[
            ...(selectedRowKeys.length > 0
               ? [
                    <FooterToolbar
                       key={"create-task-footer"}
                       extra={
                          <div>
                             <div className="text-base">
                                Time to complete:{" "}
                                {api.data?.issues
                                   .filter((i) => selectedRowKeys.find((i2) => i2.toString() === i.id))
                                   .reduce((acc, curr) => acc + curr.typeError.duration, 0)}{" "}
                                minute(s)
                             </div>
                          </div>
                       }
                    >
                       <Button type="primary" icon={<PlusOutlined />}>
                          Create Task
                       </Button>
                    </FooterToolbar>,
                 ]
               : []),
         ]}
         header={{
            title: (
               <div className="flex items-center gap-3">
                  <Button icon={<LeftOutlined />} onClick={router.back} />
                  <span>Request Details</span>
               </div>
            ),
            breadcrumb: {
               items: [
                  {
                     title: "Dashboard",
                     onClick: () => router.push("/head-staff/desktop/dashboard"),
                  },
                  {
                     title: "Requests",
                     onClick: () => router.push("/head-staff/desktop/requests"),
                  },
                  {
                     title: "Details",
                  },
               ],
            },
         }}
         subTitle={<Tag>{api.data?.status}</Tag>}
         tabList={[
            {
               tab: "Issues",
               key: "issues",
               children: (
                  <ProTable<FixRequestIssueDto>
                     cardBordered
                     rowKey={(row) => row.id}
                     rowSelection={{
                        selectedRowKeys,
                        onChange: (keys: Key[]) => setSelectedRowKeys(keys),
                        columnWidth: 30,
                        type: "checkbox",
                     }}
                     headerTitle={
                        <div className="flex items-center gap-2">
                           <span>Request Issues</span>
                           <span className="text-xs font-normal text-gray-500">
                              {api.data?.issues.length} issue{api.data?.issues.length !== 1 && "s"} found
                           </span>
                        </div>
                     }
                     dataSource={api.data?.issues}
                     loading={api.isPending}
                     toolBarRender={() => [
                        ...(selectedRowKeys.length > 0
                           ? [
                                <Tooltip
                                   key="create-task-tbl-btn"
                                   title={selectedRowKeys.length === 0 ? "Select Issues to create Task" : ""}
                                >
                                   <Button icon={<PlusOutlined />} disabled={selectedRowKeys.length === 0}>
                                      Create Task with Selected
                                   </Button>
                                </Tooltip>,
                             ]
                           : []),
                        <CreateIssueDrawer
                           key={"create-issue-tbl-btn"}
                           drawerProp={{
                              placement: "right",
                              width: "30rem",
                           }}
                           onSuccess={async () => {
                              await api.refetch()
                           }}
                        >
                           {(handleOpen) => (
                              <Button icon={<PlusOutlined />} type="primary" onClick={() => handleOpen(params.id)}>
                                 New Issue
                              </Button>
                           )}
                        </CreateIssueDrawer>,
                     ]}
                     search={false}
                     virtual
                     summary={(pageData) => {
                        const totalDuration = pageData.reduce((acc, curr) => acc + curr.typeError.duration, 0)
                        return (
                           <Table.Summary.Row className="bg-gray-50 *:bg-gray-50">
                              <Table.Summary.Cell index={0}></Table.Summary.Cell>
                              <Table.Summary.Cell index={1}></Table.Summary.Cell>
                              <Table.Summary.Cell index={2}></Table.Summary.Cell>
                              <Table.Summary.Cell index={3}>
                                 <strong>Total</strong>: {totalDuration} minute{totalDuration !== 1 && "s"}
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={4}></Table.Summary.Cell>
                              <Table.Summary.Cell index={5}></Table.Summary.Cell>
                              <Table.Summary.Cell index={6}></Table.Summary.Cell>
                              <Table.Summary.Cell index={7}></Table.Summary.Cell>
                           </Table.Summary.Row>
                        )
                     }}
                     editable={{
                        type: "multiple",
                        editableKeys,
                        onDelete: async (key, row) => {
                           const { id } = row
                           mutate_deleteIssue.mutate({ id })
                        },
                        onSave: async (rowKey, data, row) => {
                           const { id, ...rest } = data
                           if (
                              row.description === rest.description &&
                              row.fixType === rest.fixType &&
                              row.typeError.id === rest.typeError.name // name is ID here. idk why
                           ) {
                              return // no changes
                           }

                           mutate_updateIssue.mutate({
                              id,
                              payload: {
                                 fixType: rest.fixType,
                                 description: rest.description,
                                 typeError: rest.typeError.name, // change to name here too (ref above)
                              },
                           })
                        },
                        onChange: setEditableRowKeys,
                     }}
                     columns={[
                        // {
                        //    title: "No.",
                        //    render: (_, __, index) => index + 1,
                        //    align: "center",
                        //    width: 50,
                        //    editable: false,
                        //    valueType: "indexBorder",
                        // },
                        {
                           title: "Error Name",
                           dataIndex: ["typeError", "name"],
                           width: 300,
                           ellipsis: true,
                           valueType: "select",
                           valueEnum: device.data?.machineModel.typeErrors.reduce((acc, curr) => {
                              acc[curr.id] = { text: curr.name, status: curr.duration }
                              return acc
                           }, {} as any),
                        },
                        {
                           key: "description",
                           title: "Description",
                           dataIndex: "description",
                           render: (_, e) => e.description,
                           ellipsis: true,
                           valueType: "textarea",
                           fieldProps: {
                              autosize: true,
                              rows: 1,
                           },
                           formItemProps: {},
                        },
                        {
                           title: "Duration",
                           dataIndex: ["typeError", "duration"],
                           tooltip: "Minutes",
                           width: 150,
                           render: (_, e) => `${e.typeError.duration} minutes`,
                           editable: false,
                        },
                        {
                           title: "Fix Type",
                           dataIndex: "fixType",
                           width: 150,
                           render: (_, e) => <Tag color={fixTypeColors[e.fixType]}>{e.fixType}</Tag>,
                           valueType: "select",
                           valueEnum: Object.keys(FixType).reduce((acc, curr) => {
                              acc[curr] = { text: curr }
                              return acc
                           }, {} as any),
                        },
                        {
                           title: "Spare Parts",
                           width: 150,
                           render: (_, e) => e.issueSpareParts.length,
                           editable: false,
                        },
                        {
                           title: "Created At",
                           dataIndex: "createdAt",
                           width: 200,
                           render: (_, e) => (
                              <Tooltip title={extended_dayjs(e.createdAt).fromNow()}>
                                 {dayjs(e.createdAt).format("DD-MM-YYYY HH:mm")}
                              </Tooltip>
                           ),
                           editable: false,
                        },
                        {
                           title: "Updated At",
                           width: 200,
                           dataIndex: "updatedAt",
                           sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
                           render: (_, e) => (
                              <Tooltip title={extended_dayjs(e.updatedAt).fromNow()}>
                                 {dayjs(e.updatedAt).format("DD-MM-YYYY HH:mm")}
                              </Tooltip>
                           ),
                           sortOrder: "descend",
                           hidden: true,
                           editable: false,
                        },
                        {
                           width: 170,
                           align: "right",
                           fixed: "right",
                           valueType: "option",
                           render: (_, e, __, action) => (
                              <Flex gap={2} justify="end">
                                 <Button type="link" size="middle" onClick={() => action?.startEditable(e.id)}>
                                    Edit
                                 </Button>
                                 <Button type={"link"} size={"middle"}>
                                    Spare Parts
                                 </Button>
                              </Flex>
                           ),
                        },
                     ]}
                  />
               ),
            },
            {
               tab: "Tasks",
               key: "tasks",
               children: (
                  <ProTable
                     headerTitle={
                        <div className="flex items-center gap-2">
                           <span>Request Tasks</span>
                           <span className="text-xs font-normal text-gray-500">
                              {api.data?.tasks.length} task{api.data?.tasks.length !== 1 && "s"} found
                           </span>
                        </div>
                     }
                     dataSource={api.data?.tasks}
                     loading={api.isPending}
                     search={false}
                     columns={[
                        {
                           title: "No.",
                           render: (_, __, index) => index + 1,
                        },
                        {
                           title: "Error",
                           dataIndex: "name",
                        },
                        {
                           title: "Status",
                           dataIndex: "status",
                        },
                        {
                           title: "Created",
                           dataIndex: "createdAt",
                           render: (_, e) => dayjs(e.createdAt).format("DD-MM-YYYY HH:mm"),
                        },
                     ]}
                  />
               ),
            },
         ]}
         content={
            <>
               <ProDescriptions
                  dataSource={api.data}
                  loading={api.isPending}
                  columns={[
                     {
                        title: "Created",
                        dataIndex: "createdAt",
                        render: (_, e) => dayjs(e.createdAt).format("DD-MM-YYYY HH:mm"),
                     },
                     {
                        title: "Updated",
                        dataIndex: "updatedAt",
                        render: (_, e) => dayjs(e.updatedAt).format("DD-MM-YYYY HH:mm"),
                     },
                     {
                        title: "Requested By",
                        render: (_, e) => e.requester?.username ?? "-",
                     },
                     {
                        title: "Requester Note",
                        span: 3,
                        dataIndex: "requester_note",
                        render: (_, e) => e.requester_note,
                     },
                  ]}
               />
               {api.isSuccess && (
                  <Card size="default">
                     <ProDescriptions
                        title={"Device"}
                        bordered
                        size="middle"
                        dataSource={api.data?.device}
                        columns={[
                           {
                              title: "Machine Model",
                              dataIndex: ["machineModel", "name"],
                              render: (_, e) => e.machineModel.name,
                           },
                           {
                              title: "Manufacturer",
                              dataIndex: ["machineModel", "manufacturer"],
                           },
                           {
                              title: "Position",
                              dataIndex: ["area", "positionX", "positionY"],
                              render: (_, e) => `${e.area.name} (${e.positionX}x${e.positionY})`,
                           },
                           {
                              title: "Operation Status",
                              dataIndex: "operationStatus",
                           },
                           {
                              title: "Description",
                              dataIndex: "description",
                              span: 3,
                           },
                           {
                              title: "Year of Production",
                              dataIndex: ["machineModel", "yearOfProduction"],
                           },
                           {
                              title: "Date of Receipt",
                              dataIndex: ["machineModel", "dateOfReceipt"],
                           },
                           {
                              title: "Warranty Term",
                              dataIndex: ["machineModel", "warrantyTerm"],
                           },
                        ]}
                     />
                  </Card>
               )}
            </>
         }
      ></PageContainer>
   )
}
// <ProList<FixRequestIssueDto>
//    dataSource={api.data?.issues}
//    rowKey="id"
//    headerTitle={
//       <div className="flex items-center gap-2">
//          <span>Request Issues</span>
//          <span className="text-xs font-normal text-gray-500">
//             {api.data?.issues.length ?? "-"} issue{api.data?.issues.length !== 1 && "s"} found
//          </span>
//       </div>
//    }
//    loading={api.isPending}
//    expandable={{ expandedRowKeys, onExpandedRowsChange: setExpandedRowKeys }}
//    rowSelection={rowSelection}
//    toolBarRender={() => {
//       return [
//          <Button key="create-issue" type="primary" icon={<PlusOutlined />}>
//             Create Issue
//          </Button>,
//       ]
//    }}
//    metas={{
//       title: {
//          dataIndex: "typeError",
//          render: (_, e) => e.typeError.name,
//       },
//       avatar: {
//          render: (_, e, index) => <Avatar icon={index + 1} />,
//          editable: false,
//       },
//       subtitle: {
//          render: (_: any, e: any) => <Tag>{e.fixType}</Tag>,
//       },
//
//       actions: {
//          render: (text, row, index, action) => [
//             <a
//                onClick={() => {
//                   action?.startEditable(row.id)
//                }}
//                key="link"
//             >
//                Edit
//             </a>,
//             <a
//                onClick={() => {
//                   action?.startEditable(row.id)
//                }}
//                key="link"
//             >
//                Delete
//             </a>,
//          ],
//       },
//    }}
// />