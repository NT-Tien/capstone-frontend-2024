"use client"

import Stockkeeper_Task_ReceiveSpareParts from "@/app/stockkeeper/_api/task/receive-spare-parts.api"
import DataListView from "@/components/DataListView"
import RootHeader from "@/common/components/RootHeader"
import { TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import qk from "@/common/querykeys"
import { cn } from "@/common/util/cn.util"
import { LeftOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Button, List, Tag, Typography } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import Stockkeeper_Task_GetById from "../../../../_api/task/getById.api"

export default function TaskDetails({ params }: { params: { id: string } }) {
   const { message } = App.useApp()

   const api_task = useQuery({
      queryKey: qk.task.one_byId(params.id),
      queryFn: () => Stockkeeper_Task_GetById({ id: params.id }),
   })
   const router = useRouter()

   const isWarranty = useMemo(() => {
      return false
   }, [])

   const spareParts = useMemo(() => {
      return api_task.data?.issues.flatMap((i) => i.issueSpareParts) ?? []
   }, [api_task.data])

   const mutate_confirmReceipt = useMutation({
      mutationFn: Stockkeeper_Task_ReceiveSpareParts,
      onMutate: async () => {
         message.destroy("confirmReceipt")
         message.loading({
            content: "Đang thực hiện...",
            key: "confirmReceipt",
         })
      },
      onError: async (e) => {
         message.error({
            content: e.message,
            key: "confirmReceipt",
         })
      },
      onSuccess: async () => {
         message.success({
            content: "Thành công",
         })
      },
      onSettled: () => {
         message.destroy("confirmReceipt")
      },
   })

   function handleConfirmReceipt() {
      mutate_confirmReceipt.mutate(
         {
            id: params.id,
         },
         {
            onSuccess: async () => {
               await api_task.refetch()
               router.push("/stockkeeper/mobile/scan")
            },
         },
      )
   }

   return (
      <div className="std-layout pb-44">
         <RootHeader
            title="Kết quả QR"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            className="std-layout-outer p-4"
         />
         <ProDescriptions
            className="mt-layout"
            bordered={true}
            dataSource={api_task.data}
            loading={api_task.isLoading}
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
               ...(isWarranty
                  ? [
                       {
                          key: "type",
                          label: "Ghi chú",
                          render: () => "Tác vụ bảo hành",
                       },
                    ]
                  : []),
            ]}
         />
         {isWarranty ? (
            <>
               <div className="std-layout-outer mt-layout">
                  <h2 className="mb-2 px-layout text-lg font-semibold">Chi tiết thiết bị</h2>
                  <DataListView
                     dataSource={api_task.data?.device}
                     bordered
                     itemClassName="py-2"
                     labelClassName="font-normal text-neutral-500"
                     items={[
                        {
                           label: "Mẫu máy",
                           value: (s) => s.machineModel?.name,
                        },
                        {
                           label: "Nhà sản xuất",
                           value: (s) => s.machineModel.manufacturer,
                        },
                        {
                           label: "Năm sản xuất",
                           value: (s) => s.machineModel.yearOfProduction,
                        },
                        {
                           label: "Mô tả",
                           value: (s) => s.description,
                        },
                     ]}
                  />
               </div>
            </>
         ) : (
            <section>
               <List
                  dataSource={spareParts}
                  grid={{
                     column: 1,
                  }}
                  size={"small"}
                  itemLayout={"vertical"}
                  className={cn("mt-3")}
                  header={
                     <Typography.Title level={5} className="m-0">
                        Linh kiện ({spareParts.length})
                     </Typography.Title>
                  }
                  split={false}
                  renderItem={(item) => (
                     <List.Item>
                        <List.Item.Meta title={item.sparePart.name} description={"Số lượng: " + item.quantity} />
                     </List.Item>
                  )}
               />
            </section>
         )}
         {!(api_task.isSuccess && api_task.data.confirmReceipt) && (
            <section className="fixed bottom-0 left-0 w-full bg-white p-layout shadow-fb">
               <Button type="primary" size="large" className="w-full" onClick={handleConfirmReceipt}>
                  Hoàn tất lấy linh kiện
               </Button>
            </section>
         )}
      </div>
   )
}
