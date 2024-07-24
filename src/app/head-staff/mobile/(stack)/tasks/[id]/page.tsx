"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import HeadStaff_Task_OneById from "@/app/head-staff/_api/task/one-byId.api"
import RootHeader from "@/common/components/RootHeader"
import { LeftOutlined, UserOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { App, Avatar, Card, Collapse, Empty, List, Tabs, Tag, Typography } from "antd"
import { FixType } from "@/common/enum/fix-type.enum"
import HeadStaff_SparePart_Create from "@/app/head-staff/_api/spare-part/create.api"
import HeadStaff_SparePart_Delete from "@/app/head-staff/_api/spare-part/delete.api"
import HeadStaff_Task_UpdateAssignFixer from "@/app/head-staff/_api/task/update-assignFixer.api"
import { useTranslation } from "react-i18next"
import { useIssueRequestStatusTranslation } from "@/common/enum/use-issue-request-status-translation"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import DeviceDetailsCard from "@/common/components/DeviceDetailsCard"
import React, { useState } from "react"
import DataListView from "@/common/components/DataListView"
import { MapPin } from "@phosphor-icons/react"

export default function TaskDetails({ params }: { params: { id: string } }) {
   const api = useQuery({
      queryKey: qk.task.one_byId(params.id),
      queryFn: () => HeadStaff_Task_OneById({ id: params.id }),
   })
   const request = useQuery({
      queryKey: qk.issueRequests.byId(api.data?.request.id ?? ""),
      queryFn: () => HeadStaff_Request_OneById({ id: api.data?.request.id ?? "" }),
      enabled: api.isSuccess,
   })
   const router = useRouter()
   const { t } = useTranslation()
   const { getFixTypeTranslation } = useIssueRequestStatusTranslation()

   const [tab, setTab] = useState("details")

   return (
      <div className="std-layout">
         <RootHeader
            title="Thông tin chi tiết"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            className="std-layout-outer p-4"
         />
         <Tabs
            className="main-tabs std-layout-outer"
            type="line"
            activeKey={tab}
            onChange={(key) => setTab(key)}
            items={[
               {
                  key: "details",
                  label: "Tác vụ",
               },
               {
                  key: "issues",
                  label: "Vấn đề",
                  children: (
                     <div>
                        {request.isSuccess && request.data.issues.length !== 0 && (
                           <Collapse
                              expandIconPosition="end"
                              items={request.data?.issues.map((item: FixRequestIssueDto) => ({
                                 key: item.id,
                                 label: (
                                    <div>
                                       <Tag color={item.fixType === FixType.REPAIR ? "red" : "blue"}>
                                          {getFixTypeTranslation(item.fixType)}
                                       </Tag>
                                       <Typography.Text className="w-40">{item.typeError.name}</Typography.Text>
                                    </div>
                                 ),
                                 children: (
                                    <div>
                                       <Card size={"small"}>
                                          <span className="truncate">
                                             <span className="text-gray-500">Mô tả: </span>
                                             {item.description}
                                          </span>
                                       </Card>
                                       <div className="mt-2 w-full">
                                          {item.issueSpareParts.length === 0 ? (
                                             <Card className="my-3">
                                                <Empty
                                                   description={
                                                      <span>
                                                         Vấn đề này{" "}
                                                         <strong className="font-bold underline">không có linh kiện thay thế</strong>{" "}
                                                         được chỉ định
                                                      </span>
                                                   }
                                                   className="rounded-lg py-6"
                                                />
                                             </Card>
                                          ) : (
                                             <List
                                                className={"w-full"}
                                                dataSource={item.issueSpareParts}
                                                itemLayout={"horizontal"}
                                                size={"small"}
                                                renderItem={(sp) => (
                                                   <List.Item itemID={sp.id} key={sp.id}>
                                                      <List.Item.Meta
                                                         title={sp.sparePart.name}
                                                         description={`${"Số lượng"}: ${sp.quantity}`}
                                                      ></List.Item.Meta>
                                                   </List.Item>
                                                )}
                                             />
                                          )}
                                       </div>
                                    </div>
                                 ),
                              }))}
                           />
                        )}
                     </div>
                  ),
               },
            ]}
         />

         {tab === "details" && (
            <>
               <ProDescriptions
                  className="mt-3"
                  dataSource={api.data}
                  loading={api.isLoading}
                  size="small"
                  columns={[
                     {
                        key: "name",
                        label: "Tên tác vụ",
                        dataIndex: "name",
                     },
                     {
                        key: "created",
                        label: "Ngày tạo",
                        dataIndex: "createdAt",
                        render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                     },
                     {
                        key: "status",
                        label: "Trạng thái",
                        dataIndex: "status",
                        render: (_, e) => <Tag>{e.status}</Tag>,
                     },
                     {
                        key: "priority",
                        label: "Mức độ ưu tiên",
                        render: (_, e) =>
                           e.priority ? <Tag color="red">Cao</Tag> : <Tag color="green">Thấp</Tag>,
                     },
                     {
                        key: "totalTime",
                        label: "Tổng thời lượng",
                        render: (_, e) => e.totalTime + " phút",
                     },
                     {
                        key: "operator",
                        label: "Thông số kỹ thuật",
                        dataIndex: "operator",
                     },
                  ]}
               />
               <Card
                  size="small"
                  classNames={{
                     body: "flex",
                  }}
               >
                  <Avatar icon={<UserOutlined />} />
                  <div className="ml-3">
                     <div className="text-base font-semibold">{api.data?.fixer.username}</div>
                     <div className="text-xs">{api.data?.fixer.phone}</div>
                  </div>
               </Card>
               <section className="std-layout-outer mt-6 rounded-lg bg-white py-layout">
                  <h2 className="mb-2 px-layout text-base font-semibold">Chi tiết thiết bị</h2>
                  <DataListView
                     dataSource={api.data?.device}
                     bordered
                     itemClassName="py-2"
                     labelClassName="font-normal text-neutral-500 text-sub-base"
                     valueClassName="text-sub-base"
                     items={[
                        {
                           label: "Mẫu máy",
                           value: (s) => s.machineModel?.name,
                        },
                        {
                           label: "Khu vực",
                           value: (s) => s.area?.name,
                        },
                        {
                           label: "Vị trí (x, y)",
                           value: (s) => (
                              <a className="flex items-center gap-1">
                                 {s.positionX} x {s.positionY}
                                 <MapPin size={16} weight="fill" />
                              </a>
                           ),
                        },
                        {
                           label: "Nhà sản xuất",
                           value: (s) => s.machineModel?.manufacturer,
                        },
                        {
                           label: "Năm sản xuất",
                           value: (s) => s.machineModel?.yearOfProduction,
                        },
                        {
                           label: "Thời hạn bảo hành",
                           value: (s) => s.machineModel?.warrantyTerm,
                        },
                        {
                           label: "Description",
                           value: (s) => s.description,
                        },
                     ]}
                  />
               </section>
            </>
         )}
      </div>
   )
}
