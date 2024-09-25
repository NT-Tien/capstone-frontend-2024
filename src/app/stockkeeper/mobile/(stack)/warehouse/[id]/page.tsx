"use client"

import Stockkeeper_MachineModel_GetById from "@/app/stockkeeper/_api/machine-model/getById.api"
import Stockkeeper_SparePart_Update, {
   Request as UpdateRequest,
   Response as UpdateResponse,
} from "@/app/stockkeeper/_api/spare-part/update-spare-part-by-id.api"
import RootHeader from "@/components/layout/RootHeader"
import qk from "@/old/querykeys"
import { LeftOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Card, Collapse, Input } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function MachineModelDetails({ params }: { params: { id: string } }) {
   const result = useQuery({
      queryKey: qk.machineModels.one_byId(params.id),
      queryFn: () => Stockkeeper_MachineModel_GetById({ id: params.id }),
   })
   const router = useRouter()
   const { message } = App.useApp()
   const [quantityInputs, setQuantityInputs] = useState<{ [key: string]: number }>({})
   const mutation = useMutation<UpdateResponse, Error, UpdateRequest>({
      mutationFn: (req) => Stockkeeper_SparePart_Update(req),
      onSuccess: () => {
         qk.machineModels.one_byId(params.id)
         message.success("Cập nhật số lượng linh kiện thành công")
      },
      onError: (error, variables) => {
         message.error("Cập nhật số lượng linh kiện thất bại")
         setQuantityInputs((prev) => ({
            ...prev,
            [variables.id]: result.data?.spareParts.find((part) => part.id === variables.id)?.quantity ?? 0,
         }))
      },
   })

   const handleUpdateQuantity = (id: string, quantity: number) => {
      setQuantityInputs((prev) => ({ ...prev, [id]: quantity }))
      mutation.mutate(
         { id, payload: { quantity } },
         {
            onSuccess: () => {
               qk.machineModels.one_byId(params.id)
            },
            onError: (error, variables) => {
               message.error("Cập nhật số lượng linh kiện thất bại")
               setQuantityInputs((prev) => ({
                  ...prev,
                  [variables.id]: result.data?.spareParts.find((part) => part.id === variables.id)?.quantity ?? 0,
               }))
            },
         },
      )
   }

   const handleInputChange = (id: string, value: number) => {
      setQuantityInputs({ ...quantityInputs, [id]: value })
   }

   const handleInputSubmit = (id: string) => {
      if (quantityInputs[id] !== undefined) {
         handleUpdateQuantity(id, quantityInputs[id])
      }
   }
   const handleKeyDown = (id: string, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
         handleInputSubmit(id)
      }
   }

   return (
      <div
         style={{
            display: "grid",
            gridTemplateColumns: "[outer-start] 16px [inner-start] 1fr [inner-end] 16px [outer-end] 0",
         }}
      >
         <RootHeader
            title="Chi tiết thiết bị"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            className="p-4"
            style={{
               gridColumn: "outer-start / outer-end",
            }}
         />
         <ProDescriptions
            className="mt-3"
            bordered={true}
            style={{
               gridColumn: "inner-start / inner-end",
            }}
            dataSource={result.data}
            loading={result.isLoading}
            size="small"
            columns={[
               {
                  key: "name",
                  label: "Tên",
                  dataIndex: "name",
               },
               {
                  key: "description",
                  label: "Mô tả",
                  dataIndex: "description",
               },
               {
                  key: "manufacturer",
                  label: "Nhà sản xuất",
                  dataIndex: "manufacturer",
               },
               {
                  key: "yearOfProduction",
                  label: "Năm sản xuất",
                  dataIndex: "yearOfProduction",
               },
               {
                  key: "dateOfReceipt",
                  label: "Ngày nhập kho",
                  dataIndex: "dateOfReceipt",
                  render: (_, e) => dayjs(e.dateOfReceipt).add(7, "hours").format("DD/MM/YYYY - HH:mm"),
               },
               {
                  key: "warrantyTerm",
                  label: "Thời hạn bảo hành",
                  dataIndex: "warrantyTerm",
                  render: (_, e) => dayjs(e.warrantyTerm).add(7, "hours").format("DD/MM/YYYY - HH:mm"),
               },
            ]}
         />
         <Collapse className="mt-4" style={{ gridColumn: "inner-start / inner-end" }} bordered={false} ghost>
            {result.data?.spareParts.map((part) => (
               <Collapse.Panel header={part.name} key={part.id}>
                  <Card size="small">
                     <p>
                        <strong>Tên:</strong> {part.name}
                     </p>
                     <p>
                        <strong>Ngày hết hạn:</strong> {dayjs(part.expirationDate).add(7, "hours").format("DD/MM/YYYY")}
                     </p>
                     <div>
                        <p>
                           <strong>Số lượng: </strong>
                           <PlusOutlined
                              onClick={() =>
                                 handleUpdateQuantity(part.id, (quantityInputs[part.id] ?? part.quantity) + 1)
                              }
                           />
                           <Input
                              type="number"
                              value={quantityInputs[part.id] ?? part.quantity}
                              onChange={(e) => handleInputChange(part.id, Number(e.target.value))}
                              onBlur={() => handleInputSubmit(part.id)}
                              onKeyDown={(e) => handleKeyDown(part.id, e)}
                              style={{ width: "60px", margin: "0 8px", textAlign: "center" }}
                           />
                           <MinusOutlined
                              onClick={() =>
                                 handleUpdateQuantity(part.id, (quantityInputs[part.id] ?? part.quantity) - 1)
                              }
                           />
                        </p>
                     </div>
                  </Card>
               </Collapse.Panel>
            ))}
         </Collapse>
      </div>
   )
}
