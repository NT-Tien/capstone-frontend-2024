import { Button, Flex, Tag, Tooltip } from "antd"
import IssueDetailsDrawer from "@/app/head-staff/_components/IssueDetailsDrawer"
import { ProTable } from "@ant-design/pro-components"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import extended_dayjs from "@/config/dayjs.config"
import dayjs from "dayjs"
import { DeviceDto } from "@/common/dto/Device.dto"
import { Issue_StatusData, Issue_StatusMapper } from "@/common/dto/status/Issue.status"

type Props = {
   refetch: () => void
   isLoading: boolean
   issues: FixRequestIssueDto[] | undefined
   device: DeviceDto | undefined
}

export default function IssuesTab(props: Props) {
   return (
      <IssueDetailsDrawer refetch={props.refetch}>
         {(handleOpen) => (
            <ProTable<FixRequestIssueDto>
               cardBordered
               rowKey={(row) => row.id}
               headerTitle={
                  <div className="flex items-center gap-2">
                     <span>Vấn đề yêu cầu</span>
                     <span className="text-xs font-normal text-gray-500">
                        {props.issues?.length ?? "-"} vấn đề{props.issues?.length !== 1 && "s"} tìm thấy
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
                     title: "Trạng thái",
                     dataIndex: ["status"],
                     align: "center",
                     width: 100,
                     render: (_, e) => (
                        <Tag color={Issue_StatusMapper(e).colorInverse}>{Issue_StatusMapper(e).text}</Tag>
                     ),
                  },
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
                  },
                  {
                     title: "Thời lượng",
                     dataIndex: ["typeError", "duration"],
                     tooltip: "Minutes",
                     width: 150,
                     render: (_, e) => `${e.typeError.duration} phút`,
                     editable: false,
                  },
                  {
                     title: "Cách sửa",
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
                     title: "Ngày tạo",
                     dataIndex: "createdAt",
                     width: 200,
                     render: (_, e) => (
                        <Tooltip title={extended_dayjs(e.createdAt).add(7, "hours").fromNow()}>
                           {dayjs(e.createdAt).add(7, "hours").format("DD-MM-YYYY HH:mm")}
                        </Tooltip>
                     ),
                     editable: false,
                  },
                  {
                     title: "Ngày cập nhật",
                     width: 200,
                     dataIndex: "updatedAt",
                     sorter: (a, b) =>
                        dayjs(a.updatedAt).add(7, "hours").unix() - dayjs(b.updatedAt).add(7, "hours").unix(),
                     render: (_, e) => (
                        <Tooltip title={extended_dayjs(e.updatedAt).add(7, "hours").fromNow()}>
                           {dayjs(e.updatedAt).add(7, "hours").format("DD-MM-YYYY HH:mm")}
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
                                 Xem thêm
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
