import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { Key, useEffect, useState } from "react"
import { App, Button, Flex, Table, Tag, Tooltip } from "antd"
import { EditOutlined, PlusOutlined } from "@ant-design/icons"
import CreateIssueDrawer from "@/app/head-staff/_components/CreateIssue.drawer"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import extended_dayjs from "@/config/dayjs.config"
import dayjs from "dayjs"
import { ProTable } from "@ant-design/pro-components"
import { useMutation } from "@tanstack/react-query"
import HeadStaff_Issue_Delete from "@/app/head-staff/_api/issue/delete.api"
import HeadStaff_Issue_Update from "@/app/head-staff/_api/issue/update.api"
import { DeviceDto } from "@/common/dto/Device.dto"
import IssueDetailsDrawer from "@/app/head-staff/desktop/requests/[id]/IssueDetailsDrawer"
import { useRouter } from "next/navigation"

type Props = {
   refetch: () => void
   isLoading: boolean
   id: string
   issues: FixRequestIssueDto[] | undefined
   device: DeviceDto | undefined
   selectedRowKeys: Key[]
   setSelectedRowKeys: (keys: Key[]) => void
}

export default function IssuesTab(props: Props) {
   const { message } = App.useApp()
   const router = useRouter()
   const [editableKeys, setEditableRowKeys] = useState<Key[]>([])

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
            content: "Xóa vấn đề thất bại.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: "Xóa vấn đề thành công.",
         })
         props.refetch()
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
            content: "Cập nhật vấn đề thất bại.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: "Cập nhật vấn đề thành công.",
         })
         props.refetch()
      },
      onSettled: (_, __, req) => {
         message.destroy(`update-issue-${req.id}`)
      },
   })

   return (
      <IssueDetailsDrawer refetch={props.refetch}>
         {(handleOpen) => (
            <ProTable<FixRequestIssueDto>
               cardBordered
               rowKey={(row) => row.id}
               rowSelection={{
                  selectedRowKeys: props.selectedRowKeys,
                  onChange: (keys: Key[]) => props.setSelectedRowKeys(keys),
                  columnWidth: 30,
                  type: "checkbox",
               }}
               headerTitle={
                  <div className="flex items-center gap-2">
                     <span>Báo cáo yêu cầu</span>
                     <span className="text-xs font-normal text-gray-500">
                        {props.issues?.length} vấn đề
                     </span>
                  </div>
               }
               dataSource={props.issues}
               loading={props.isLoading}
               toolBarRender={() => [
                  <CreateIssueDrawer
                     key={"create-issue-tbl-btn"}
                     drawerProp={{
                        placement: "right",
                        width: "30rem",
                     }}
                     onSuccess={async () => {
                        props.refetch()
                     }}
                  >
                     {(handleOpen) => (
                        <Button icon={<PlusOutlined />} type="primary" onClick={() => handleOpen(props.id)}>
                           Tạo vấn đề
                        </Button>
                     )}
                  </CreateIssueDrawer>,
               ]}
               search={false}
               virtual={true}
               // scroll={{ x: 500 }}
               summary={(pageData) => {
                  const totalDuration = pageData.reduce((acc, curr) => acc + curr.typeError.duration, 0)
                  return (
                     <Table.Summary.Row className="bg-gray-50 *:bg-gray-50">
                        <Table.Summary.Cell index={0}></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}></Table.Summary.Cell>
                        <Table.Summary.Cell index={2}></Table.Summary.Cell>
                        <Table.Summary.Cell index={3} className="text-base">
                           <strong>Tổng cộng</strong>: {totalDuration} phút{totalDuration !== 1 && "s"}
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
                  onDelete: async (_, row) => {
                     const { id } = row
                     mutate_deleteIssue.mutate({ id })
                  },
                  onSave: async (rowKey, data, row) => {
                     const { id, ...rest } = data
                     if (
                        row.description === rest.description &&
                        row.fixType === rest.fixType &&
                        row.typeError.id === rest.typeError.id // name is ID here. idk why
                     ) {
                        return // no changes
                     }

                     mutate_updateIssue.mutate({
                        id,
                        payload: {
                           fixType: rest.fixType,
                           description: rest.description,
                           typeError: rest.typeError.id, // change to name here too (ref above)
                        },
                     })
                  },
                  onChange: setEditableRowKeys,
               }}
               columns={[
                  {
                     title: "Tên lỗi",
                     dataIndex: ["typeError", "name"],
                     ellipsis: true,
                     width: 200,
                     valueType: "select",
                     valueEnum: props.device?.machineModel.typeErrors.reduce((acc, curr) => {
                        acc[curr.id] = { text: curr.name, status: curr.duration }
                        return acc
                     }, {} as any),
                  },
                  {
                     key: "description",
                     title: "Mô tả",
                     dataIndex: "description",
                     render: (_, e) => e.description,
                     ellipsis: true,
                     width: 200,
                     valueType: "textarea",
                     fieldProps: {
                        autosize: true,
                        rows: 1,
                     },
                     formItemProps: {},
                  },
                  {
                     title: "Thời lượng",
                     dataIndex: ["typeError", "duration"],
                     tooltip: "Minutes",
                     width: 150,
                     render: (_, e) => `${e.typeError.duration} minutes`,
                     editable: false,
                  },
                  {
                     title: "Cách sửa chữa",
                     dataIndex: "fixType",
                     width: 100,
                     render: (_, e) => (
                        <Tag color={FixTypeTagMapper[String(e.fixType)].colorInverse}>
                           {FixTypeTagMapper[String(e.fixType)].text}
                        </Tag>
                     ),
                     valueType: "select",
                     valueEnum: Object.keys(FixType).reduce((acc, curr) => {
                        acc[curr] = { text: curr }
                        return acc
                     }, {} as any),
                  },
                  {
                     title: "Tác vụ",
                     width: 100,
                     ellipsis: true,
                     editable: false,
                     render: (_, e) =>
                        e.task ? (
                           <Button
                              type="default"
                              size="small"
                              onClick={() => router.push(`/head-staff/desktop/tasks/${e.task.id}`)}
                           >
                              Đi đến tác vụ
                           </Button>
                        ) : (
                           <div>-</div>
                        ),
                  },
                  {
                     title: "Linh kiện thay thế",
                     width: 150,
                     render: (_, e) => (
                        <div className="flex items-center gap-2">
                           {e.issueSpareParts.length === 0 ? (
                              <Button
                                 size={"small"}
                                 icon={<PlusOutlined />}
                                 type="default"
                                 onClick={() => handleOpen(e.id, props.device?.id ?? "")}
                              >
                                 Thêm
                              </Button>
                           ) : (
                              <span>{e.issueSpareParts.length}</span>
                           )}
                        </div>
                     ),
                     editable: false,
                  },
                  {
                     title: "Ngày tạo",
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
                     title: "Ngày cập nhật",
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
                     width: 140,
                     align: "right",
                     fixed: "right",
                     valueType: "option",
                     render: (_, e, __, action) => (
                        <Flex gap={2} justify="end">
                           {props.device !== undefined && (
                              <Button
                                 type={"link"}
                                 size={"middle"}
                                 onClick={() => handleOpen(e.id, props.device?.id ?? "")}
                              >
                                 Xem thêm
                              </Button>
                           )}
                           <Button type="link" size="middle" onClick={() => action?.startEditable(e.id)}>
                              Edit
                           </Button>
                        </Flex>
                     ),
                  },
               ]}
            />
         )}
      </IssueDetailsDrawer>
   )
}
