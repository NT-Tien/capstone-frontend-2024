"use client"

import RootHeader from "@/common/components/RootHeader"
import qk from "@/common/querykeys"
import { InfoCircleFilled, LeftOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Button, Card, Checkbox, List, Tag, Typography } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import Stockkeeper_Task_GetById from "../../../../_api/task/getById.api"
import { TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import Stockkeeper_Task_ReceiveSpareParts from "@/app/stockkeeper/_api/task/receive-spare-parts.api"
import { cn } from "@/common/util/cn.util"
import { CheckCard } from "@ant-design/pro-card"
import { useMemo, useState } from "react"

export default function TaskDetails({ params }: { params: { id: string } }) {
   const { message } = App.useApp()

   const api_task = useQuery({
      queryKey: qk.task.one_byId(params.id),
      queryFn: () => Stockkeeper_Task_GetById({ id: params.id }),
   })
   const router = useRouter()

   const [currentChecked, setCurrentChecked] = useState<{ [key: string]: boolean }>({})

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
            },
         },
      )
   }

   return (
      <div className="std-layout pb-44">
         <RootHeader
            title="Chi tiết tác vụ"
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
            ]}
         />
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
                  <div className="flex items-center justify-between">
                     <Typography.Title level={5} className="m-0">
                        Linh kiện ({spareParts.length})
                     </Typography.Title>
                     <Button
                        type="link"
                        size="small"
                        onClick={() => {
                           if (Object.keys(currentChecked).length === spareParts.length) {
                              setCurrentChecked({})
                           } else {
                              setCurrentChecked(
                                 api_task.data?.issues.reduce((acc, issue) => {
                                    issue.issueSpareParts.forEach((item) => {
                                       acc[item.id] = true
                                    })
                                    return acc
                                 }, {} as any),
                              )
                           }
                        }}
                     >
                        {Object.keys(currentChecked).length === spareParts.length ? "Unselect All" : "Select All"}
                     </Button>
                  </div>
               }
               split={false}
               renderItem={(item) => (
                  <CheckCard
                     key={item.id}
                     size="small"
                     className={cn(
                        "m-0 mb-1 h-max w-full",
                        api_task.isSuccess && api_task.data.confirmReceipt && "bg-neutral-100",
                     )}
                     bordered={true}
                     title={item.sparePart.name}
                     extra={
                        <div className="flex items-center">
                           <Tag color="blue">Số lượng: {item.quantity}</Tag>
                           {!(api_task.isSuccess && api_task.data.confirmReceipt) && (
                              <Checkbox checked={currentChecked[item.id] ?? false} />
                           )}
                        </div>
                     }
                     checked={currentChecked[item.id] ?? false}
                     onChange={(checked) => {
                        if (api_task.isSuccess && api_task.data.confirmReceipt) return
                        if (checked) {
                           setCurrentChecked({ ...currentChecked, [item.id]: true })
                        } else {
                           const { [item.id]: _, ...rest } = currentChecked
                           setCurrentChecked(rest)
                        }
                     }}
                  />
               )}
            />
         </section>
         {!(api_task.isSuccess && api_task.data.confirmReceipt) && (
            <section className="fixed bottom-0 left-0 w-full bg-white p-layout shadow-fb">
               {Object.keys(currentChecked).length !== spareParts.length && (
                  <Card size="small" className="mb-4">
                     <InfoCircleFilled className="mr-2" />
                     Vui lòng chọn tất cả linh kiện đã lấy ở trên
                  </Card>
               )}
               <Button
                  type="primary"
                  size="large"
                  className="w-full"
                  disabled={Object.keys(currentChecked).length !== spareParts.length}
                  onClick={handleConfirmReceipt}
               >
                  Hoàn tất lấy linh kiện
               </Button>
            </section>
         )}
      </div>
   )
}
