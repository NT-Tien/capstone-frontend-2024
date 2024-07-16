import { App, Button, Flex, Tag, Tooltip } from "antd"
import { useMutation } from "@tanstack/react-query"
import HeadStaff_Issue_Delete from "@/app/head-staff/_api/issue/delete.api"
import HeadStaff_Issue_Update from "@/app/head-staff/_api/issue/update.api"
import IssueDetailsDrawer from "@/app/head-staff/desktop/requests/[id]/IssueDetailsDrawer"
import { ProTable } from "@ant-design/pro-components"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { Key, useState } from "react"
import { PlusOutlined } from "@ant-design/icons"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import extended_dayjs from "@/config/dayjs.config"
import dayjs from "dayjs"
import { DeviceDto } from "@/common/dto/Device.dto"
import { IssueStatusEnumTagMapper } from "@/common/enum/issue-status.enum"

type Props = {
   refetch: () => void
   isLoading: boolean
   issues: FixRequestIssueDto[] | undefined
   device: DeviceDto | undefined
}

export default function IssuesTab(props: Props) {
   return (
      <IssueDetailsDrawer refetch={props.refetch} showActions={false}>
         {(handleOpen) => (
            <ProTable<FixRequestIssueDto>
               cardBordered
               rowKey={(row) => row.id}
               headerTitle={
                  <div className="flex items-center gap-2">
                     <span>Request Issues</span>
                     <span className="text-xs font-normal text-gray-500">
                        {props.issues?.length ?? "-"} issue{props.issues?.length !== 1 && "s"} found
                     </span>
                  </div>
               }
               dataSource={props.issues}
               loading={props.isLoading}
               search={false}
               scroll={{
                  x: 100,
               }}
               pagination={false}
               columns={[
                  {
                     title: "STT",
                     align: "center",
                     render: (_, __, index) => index + 1,
                     width: 50,
                  },
                  {
                     title: "Status",
                     dataIndex: ["status"],
                     align: "center",
                     width: 100,
                     render: (_, e) => (
                        <Tag color={IssueStatusEnumTagMapper[String(e.status)].colorInverse}>
                           {IssueStatusEnumTagMapper[String(e.status)].text}
                        </Tag>
                     ),
                  },
                  {
                     title: "Error Name",
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
                     title: "Description",
                     dataIndex: "description",
                     render: (_, e) => e.description,
                     ellipsis: true,
                     width: 200,
                     valueType: "textarea",
                     fieldProps: {
                        autosize: true,
                        rows: 1,
                     },
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
                     width: 90,
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
                     width: 90,
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
                                 View
                              </Button>
                           )}
                        </Flex>
                     ),
                  },
               ]}
            />
         )}
      </IssueDetailsDrawer>
   )
}
