"use client"

import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_Task_OneById from "@/app/head-staff/_api/task/one-byId.api"
import DetailsTab from "@/app/head-staff/mobile/(stack)/tasks/[id]/DetailsTab.componen"
import DeviceTab from "@/app/head-staff/mobile/(stack)/tasks/[id]/DeviceTab.component"
import IssuesTab from "@/app/head-staff/mobile/(stack)/tasks/[id]/IssuesTab.component"
import RootHeader from "@/common/components/RootHeader"
import qk from "@/common/querykeys"
import { LeftOutlined } from "@ant-design/icons"
import { CheckSquareOffset, MapPin, Wrench } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { Tabs } from "antd"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function TaskDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const [tab, setTab] = useState("details")

   const api = useQuery({
      queryKey: qk.task.one_byId(params.id),
      queryFn: () => HeadStaff_Task_OneById({ id: params.id }),
   })
   
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
                  label: (
                     <div className="flex items-center gap-2">
                        <CheckSquareOffset size={16} />
                        Tác vụ
                     </div>
                  ),
               },
               {
                  key: "device",
                  label: (
                     <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        Thiết bị
                     </div>
                  ),
               },
               {
                  key: "issues",
                  label: (
                     <div className="flex items-center gap-2">
                        <Wrench size={16} />
                        Vấn đề
                     </div>
                  ),
                  // children: (
                  //    <div>
                  //       {request.isSuccess && request.data.issues.length !== 0 && (
                  //          <Collapse
                  //             expandIconPosition="end"
                  //             items={request.data?.issues.map((item: FixRequestIssueDto) => ({
                  //                key: item.id,
                  //                label: (
                  //                   <div>
                  //                      <Tag color={item.fixType === FixType.REPAIR ? "red" : "blue"}>
                  //                         {FixTypeTagMapper[item.fixType].text}
                  //                      </Tag>
                  //                      <Typography.Text className="w-40">{item.typeError.name}</Typography.Text>
                  //                   </div>
                  //                ),
                  //                children: (
                  //                   <div>
                  //                      <Card size={"small"}>
                  //                         <span className="truncate">
                  //                            <span className="text-gray-500">Mô tả: </span>
                  //                            {item.description}
                  //                         </span>
                  //                      </Card>
                  //                      <div className="mt-2 w-full">
                  //                         {item.issueSpareParts.length === 0 ? (
                  //                            <Card className="my-3">
                  //                               <Empty
                  //                                  description={
                  //                                     <span>
                  //                                        Vấn đề này{" "}
                  //                                        <strong className="font-bold underline">
                  //                                           không có linh kiện thay thế
                  //                                        </strong>{" "}
                  //                                        được chỉ định
                  //                                     </span>
                  //                                  }
                  //                                  className="rounded-lg py-6"
                  //                               />
                  //                            </Card>
                  //                         ) : (
                  //                            <List
                  //                               className={"w-full"}
                  //                               dataSource={item.issueSpareParts}
                  //                               itemLayout={"horizontal"}
                  //                               size={"small"}
                  //                               renderItem={(sp) => (
                  //                                  <List.Item itemID={sp.id} key={sp.id}>
                  //                                     <List.Item.Meta
                  //                                        title={sp.sparePart.name}
                  //                                        description={`${"Số lượng"}: ${sp.quantity}`}
                  //                                     ></List.Item.Meta>
                  //                                  </List.Item>
                  //                               )}
                  //                            />
                  //                         )}
                  //                      </div>
                  //                   </div>
                  //                ),
                  //             }))}
                  //          />
                  //       )}
                  //    </div>
                  // ),
               },
            ]}
         />

         {tab === "details" && <DetailsTab api={api} />}
         {tab === "device" && <DeviceTab api={api} />}
         {tab === "issues" && <IssuesTab api_task={api} />}
      </div>
   )
}
