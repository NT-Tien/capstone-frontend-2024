"use client"

import RootHeader from "@/common/components/RootHeader"
import qk from "@/common/querykeys"
import { LeftOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import { Button, List, Tag, Typography } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import Stockkeeper_Task_GetById from "../../../../_api/task/getById.api"
import { TaskStatusTagMapper } from "@/common/enum/task-status.enum"

export default function TaskDetails({ params }: { params: { id: string } }) {
   const result = useQuery({
      queryKey: qk.task.one_byId(params.id),
      queryFn: () => Stockkeeper_Task_GetById({ id: params.id }),
   })
   const router = useRouter()

   return (
      <div className="std-layout">
         <RootHeader
            title="Chi tiết tác vụ"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            className="std-layout-outer p-4"
         />
         <ProDescriptions
            className="mt-layout"
            bordered={true}
            dataSource={result.data}
            loading={result.isLoading}
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
                  render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("DD/MM/YYYY - HH:mm"),
               },
               {
                  key: "status",
                  label: "Trạng thái",
                  dataIndex: "status",
                  render: (_, e) => (
                     <Tag color={TaskStatusTagMapper[e.status].colorInverse}>{TaskStatusTagMapper[e.status].text}</Tag>
                  ),
               },
               {
                  key: "priority",
                  label: "Độ ưu tiên",
                  render: (_, e) =>
                     e.priority ? <Tag color="red">{"Quan trọng"}</Tag> : <Tag color="green">{"Bình thường"}</Tag>,
               },
               {
                  key: "totalTime",
                  label: "Thời gian thực hiện",
                  dataIndex: "totalTime",
               },
               {
                  key: "operator",
                  label: "Thông số máy",
                  dataIndex: "operator",
               },
               {
                  key: "sp",
                  label: "Lấy linh kiện",
                  dataIndex: "confirmReceipt",
                  render: (_, e) =>
                     e.confirmReceipt ? <Tag color="green">{"Đã lấy"}</Tag> : <Tag color="red">{"Chưa lấy"}</Tag>,
               },
            ]}
         />
         <section className="mt-layout">
            <h2 className="text-lg font-medium">Linh kiện thay thế</h2>
            <List
               className={"list-no-padding mt-3"}
               dataSource={result.data?.issues.flatMap((i) => i.issueSpareParts) ?? []}
               grid={{
                  column: 2,
               }}
               renderItem={(sp) => (
                  <List.Item itemID={sp.id} key={sp.id}>
                     <List.Item.Meta
                        title={<Typography.Text strong>{sp.sparePart.name}</Typography.Text>}
                        description={`Số lượng: ${sp.quantity}`}
                     ></List.Item.Meta>
                  </List.Item>
               )}
            />
            {/* <Button className="w-full" size="large" type="primary">
               Hoàn tất lấy linh kiện
            </Button> */}
         </section>
      </div>
   )
}
