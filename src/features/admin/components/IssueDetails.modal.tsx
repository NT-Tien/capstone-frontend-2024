import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { Empty, Image, Modal, ModalProps, Tabs, Tag } from "antd"
import { ProDescriptions } from "@ant-design/pro-components"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { FixType, FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import { Issue_StatusMapper } from "@/lib/domain/Issue/IssueStatus.mapper"
import ProList from "@ant-design/pro-list/lib"
import Button from "antd/es/button"
import { clientEnv } from "@/env"
import Card from "antd/es/card"
import dayjs from "dayjs"
import { TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import Link from "next/link"

type IssueDetailsModalProps = {
   issue?: IssueDto
}

type Props = Omit<ModalProps, "children"> & IssueDetailsModalProps

function IssueDetailsModal(props: Props) {
   return (
      <Modal centered title={props.issue?.typeError.name ?? "Chi tiết lỗi"} footer={null} width="50%" {...props}>
         <ProDescriptions
            className="mt-3"
            dataSource={props.issue}
            loading={!props.issue}
            column={2}
            columns={[
               {
                  title: "Loại sửa",
                  dataIndex: "fixType",
                  render: (_, record) => (
                     <Tag color={FixTypeTagMapper[record.fixType].colorInverse}>
                        {FixTypeTagMapper[record.fixType].text}
                     </Tag>
                  ),
               },
               {
                  title: "Trạng thái",
                  dataIndex: "status",
                  render: (_, record) => (
                     <Tag color={Issue_StatusMapper(record).colorInverse}>{Issue_StatusMapper(record).text}</Tag>
                  ),
               },
               {
                  title: "Thời gian sửa chữa (dự tính)",
                  dataIndex: ["typeError", "duration"],
                  span: 2,
                  render: (_, record) => `${record.typeError.duration} phút`,
               },
               {
                  title: "Mô tả",
                  dataIndex: "description",
                  span: 2,
               },
            ]}
         />
         <Tabs
            animated={{
               inkBar: true,
               tabPane: true,
            }}
            items={[
               {
                  key: "task",
                  label: "Tác vụ",
                  children: props.issue?.task ? (
                     <ProDescriptions
                        dataSource={props.issue?.task}
                        column={1}
                        bordered
                        loading={!props.issue}
                        size="small"
                        columns={[
                           {
                              title: "Tên tác vụ",
                              dataIndex: "name",
                              span: 2,
                              render: (_, entity) => <Link href={`/admin/task/${entity.id}`}>{entity.name}</Link>,
                           },
                           {
                              title: "Trạng thái",
                              dataIndex: "status",
                              render: (_, record) => (
                                 <Tag color={TaskStatusTagMapper[record.status].colorInverse}>
                                    {TaskStatusTagMapper[record.status].text}
                                 </Tag>
                              ),
                           },
                           {
                              title: "Thời gian bắt đầu",
                              dataIndex: "fixerDate",
                              render: (_, entity) =>
                                 entity.fixerDate ? dayjs(entity.fixerDate).format("DD/MM/YYYY") : "-",
                           },
                           {
                              title: "Người sửa",
                              dataIndex: ["fixer", "username"],
                           },
                        ]}
                     />
                  ) : (
                     <Card>
                        <Empty description={"Chưa có tác vụ"} />
                     </Card>
                  ),
               },
               {
                  key: "spare-part",
                  label: `Linh kiện (${props.issue?.issueSpareParts.length})`,
                  children: (
                     <div>
                        <ProList
                           dataSource={props.issue?.issueSpareParts}
                           rowKey="id"
                           className="list-no-padding"
                           loading={!props.issue}
                           metas={{
                              title: {
                                 dataIndex: ["sparePart", "name"],
                                 render: (_, record) => <a>{record.sparePart.name}</a>,
                              },
                              description: {
                                 dataIndex: "quantity",
                                 render: (_, record) => `Số lượng: ${record.quantity}`,
                              },
                           }}
                        />
                     </div>
                  ),
               },
               {
                  key: "proof",
                  label: "Minh chứng hoàn thành",
                  children: (
                     <div>
                        <Card title="Hình ảnh" size="small">
                           {props.issue?.imagesVerify && props.issue?.imagesVerify.length > 0 ? (
                              <div className="flex gap-3">
                                 {props.issue?.imagesVerify.map((img, index) => (
                                    <Image
                                       key={index}
                                       src={clientEnv.BACKEND_URL + `/file-image/${img}`}
                                       alt={`image_${index}`}
                                       width={150}
                                       height={150}
                                       preview={{ mask: <Button>Chi tiết</Button> }}
                                    />
                                 ))}
                              </div>
                           ) : (
                              <Empty
                                 className="mt-2"
                                 description={
                                    <span className="text-gray-500">Chưa có hình ảnh minh chứng hoàn thành</span>
                                 }
                              />
                           )}
                        </Card>
                        <Card title="Video" size="small" className="mt-3">
                           {props.issue?.videosVerify ? (
                              <video
                                 src={clientEnv.BACKEND_URL + `/file-video/${props.issue.videosVerify}`}
                                 controls
                                 width="100%"
                              />
                           ) : (
                              <Empty
                                 className="mt-2"
                                 description={
                                    <span className="text-gray-500">Chưa có video minh chứng hoàn thành</span>
                                 }
                              />
                           )}
                        </Card>
                     </div>
                  ),
               },
            ]}
         />
      </Modal>
   )
}

export default IssueDetailsModal
export type { IssueDetailsModalProps }
