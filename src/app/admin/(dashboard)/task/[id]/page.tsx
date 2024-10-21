"use client"

import { PageContainer } from "@ant-design/pro-layout"
import admin_queries from "@/features/admin/queries"
import { ProDescriptions } from "@ant-design/pro-components"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { Empty, Image, Steps, Tag } from "antd"
import dayjs from "dayjs"
import Link from "next/link"
import Card from "antd/es/card"
import DeviceDetailsSection from "@/features/admin/components/sections/DeviceDetails.section"
import IssuesListSection from "@/features/admin/components/sections/IssuesList.section"
import Button from "antd/es/button"
import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import SparePartsListByIssuesSection from "@/features/admin/components/sections/SparePartsListByIssues.section"
import { clientEnv } from "@/env"

function Page({ params }: { params: { id: string } }) {
   const api_task = admin_queries.task.one({ id: params.id })

   return (
      <PageContainer
         title="Thông tin tác vụ"
         subTitle={
            api_task.isSuccess ? (
               <Tag color={TaskStatusTagMapper[api_task.data?.status].color}>
                  {TaskStatusTagMapper[api_task.data?.status].text}
               </Tag>
            ) : (
               "-"
            )
         }
         breadcrumb={{
            routes: [
               {
                  title: "Tác vụ",
               },
               {
                  title: "Chi tiết",
               },
               {
                  title: params.id,
               },
            ],
         }}
         content={
            <>
               <ProDescriptions
                  dataSource={api_task.data}
                  loading={api_task.isPending}
                  columns={[
                     {
                        title: "Tên tác vụ",
                        dataIndex: "name",
                     },
                     {
                        title: "Ưu tiên",
                        dataIndex: "priority",
                        render: (value) => (value ? "Ưu tiên" : "Bình thường"),
                     },
                     {
                        title: "Thời gian sửa",
                        dataIndex: "totalTime",
                        render: (value) => `${value} phút`,
                     },
                     {
                        title: "Ngày sửa",
                        dataIndex: "fixerDate",
                        valueType: "date",
                        render: (_, e) => (e.fixerDate ? dayjs(e.fixerDate).format("DD/MM/YYYY") : "-"),
                     },
                     {
                        title: "Người sửa",
                        dataIndex: ["fixer", "username"],
                        render: (value, entity) =>
                           entity.fixer ? <Link href={`/admin/user/${entity.fixer?.id}`}>{value}</Link> : "-",
                     },
                     {
                        title: "Ngày tạo",
                        dataIndex: "createdAt",
                        valueType: "date",
                        render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY HH:mm"),
                     },
                     {
                        title: "Ngày cập nhật",
                        dataIndex: "updatedAt",
                        valueType: "date",
                        render: (_, e) => dayjs(e.updatedAt).format("DD/MM/YYYY HH:mm"),
                     },
                  ]}
               />
               <Card className="mb-4 mt-2">
                  <Steps
                     current={api_task.isSuccess ? TaskStatusTagMapper[api_task.data.status].index : 0}
                     items={[
                        TaskStatus.AWAITING_SPARE_SPART,
                        TaskStatus.AWAITING_FIXER,
                        TaskStatus.ASSIGNED,
                        TaskStatus.IN_PROGRESS,
                        TaskStatus.HEAD_STAFF_CONFIRM,
                        TaskStatus.COMPLETED,
                     ].map((status) => ({
                        title: TaskStatusTagMapper[status].text,
                        description: (
                           <div className="text-xs text-neutral-500">{TaskStatusTagMapper[status].description}</div>
                        ),
                     }))}
                  />
               </Card>
            </>
         }
         tabProps={{
            animated: {
               tabPane: true,
               inkBar: true,
            },
         }}
         tabList={[
            // {
            //    tab: "Thông tin yêu câu",
            //    children: (
            //       <>
            //          <Card className="mb-3">
            //             <ProDescriptions
            //                dataSource={api_task.data?.request}
            //                loading={api_task.isPending}
            //                title={"Thông tin yêu cầu"}
            //                extra={
            //                   <Link href={`/admin/request/${api_task.data?.request.id}`}>
            //                      <Button type="primary">Xem Thêm</Button>
            //                   </Link>
            //                }
            //                bordered
            //                columns={[
            //                   {
            //                      title: "Mô tả",
            //                      dataIndex: ["requester_note"],
            //                      span: 3,
            //                   },
            //                   {
            //                      title: "Người yêu cầu",
            //                      dataIndex: ["requester", "username"],
            //                   },
            //                   {
            //                      title: "Ngày tạo",
            //                      dataIndex: "createdAt",
            //                      valueType: "date",
            //                      render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY HH:mm"),
            //                   },
            //                   {
            //                      title: "Trạng thái",
            //                      dataIndex: "status",
            //                      render: (_, e) => (
            //                         <Tag color={FixRequest_StatusMapper(e).colorInverse}>
            //                            {FixRequest_StatusMapper(e).text}
            //                         </Tag>
            //                      ),
            //                   },
            //                ]}
            //             />
            //          </Card>
            //          <DeviceDetailsSection device={api_task.data?.device} isLoading={api_task.isPending} />
            //       </>
            //    ),
            // },
            {
               tab: `Danh sách lỗi (${api_task.data?.issues?.length || 0})`,
               children: <IssuesListSection issues={api_task.data?.issues} isLoading={api_task.isPending} />,
            },
            {
               tab: "Linh kiện",
               children: (
                  <SparePartsListByIssuesSection issues={api_task.data?.issues} isLoading={api_task.isPending} />
               ),
            },
            ...(api_task.isSuccess &&
            new Set([TaskStatus.HEAD_STAFF_CONFIRM, TaskStatus.COMPLETED]).has(api_task.data.status)
               ? [
                    {
                       tab: "Minh chứng hoàn thành",
                       children: (
                          <div>
                             <Card title="Hình ảnh" size="small">
                                {api_task.data?.imagesVerify && api_task.data?.imagesVerify.length > 0 ? (
                                   <div className="flex gap-3">
                                      {api_task.data?.imagesVerify.map((img, index) => (
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
                                {api_task.data?.videosVerify ? (
                                   <video
                                      src={clientEnv.BACKEND_URL + `/file-video/${api_task.data.videosVerify}`}
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
                 ]
               : []),
         ]}
      ></PageContainer>
   )
}

export default Page
