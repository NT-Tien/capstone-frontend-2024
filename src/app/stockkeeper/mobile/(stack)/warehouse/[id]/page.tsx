"use client"

import qk from "@/common/querykeys"
import RootHeader from "@/common/components/RootHeader"
import { DeleteOutlined, LeftOutlined, UserOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { App, Avatar, Button, Card, Collapse, Descriptions, Input, List, Tabs, Tag, Typography } from "antd"
import { useTranslation } from "react-i18next"
import { useIssueRequestStatusTranslation } from "@/common/enum/use-issue-request-status-translation"
import Stockkeeper_MachineModel_GetById from "@/app/stockkeeper/_api/machine-model/getById.api"
import Stockkeeper_SparePart_GetById from "@/app/stockkeeper/_api/spare-part/getById.api"
import { useMutation, useQuery } from "@tanstack/react-query"
import Stockkeeper_SparePart_Update, {
   Request as UpdateRequest,
   Response as UpdateResponse,
} from "@/app/stockkeeper/_api/spare-part/update-spare-part-by-id.api"
import { useState } from "react"

export default function MachineModelDetails({ params }: { params: { id: string } }) {
   const result = useQuery({
      queryKey: qk.machineModels.one_byId(params.id),
      queryFn: () => Stockkeeper_MachineModel_GetById({ id: params.id }),
   })
   const router = useRouter()
   const { message } = App.useApp()
   const [quantityInputs, setQuantityInputs] = useState<{ [key: string]: number }>({})
   const { t } = useTranslation()
   const { getFixTypeTranslation } = useIssueRequestStatusTranslation()
   const mutation = useMutation<UpdateResponse, Error, UpdateRequest>({
      mutationFn: (req) => Stockkeeper_SparePart_Update(req),
      onSuccess: () => {
         qk.machineModels.one_byId(params.id)
         message.success(t("Spare part quantity updated successfully"))
      },
      onError: (error, variables) => {
         message.error(t("Failed to update spare part quantity"))
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
               message.error(t("Failed to update spare part quantity"))
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
            title="Task Details"
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
                  label: t("Name"),
                  dataIndex: "name",
               },
               {
                  key: "description",
                  label: t("Description"),
                  dataIndex: "description",
               },
               {
                  key: "manufacturer",
                  label: t("Manufacturer"),
                  dataIndex: "manufacturer",
               },
               {
                  key: "yearOfProduction",
                  label: t("YearOfProduction"),
                  dataIndex: "yearOfProduction",
               },
               {
                  key: "dateOfReceipt",
                  label: t("Created"),
                  dataIndex: "dateOfReceipt",
                  render: (_, e) => dayjs(e.dateOfReceipt).format("DD/MM/YYYY - HH:mm"),
               },
               {
                  key: "warrantyTerm",
                  label: t("Created"),
                  dataIndex: "warrantyTerm",
                  render: (_, e) => dayjs(e.warrantyTerm).format("DD/MM/YYYY - HH:mm"),
               },
            ]}
         />
         <Collapse className="mt-4" style={{ gridColumn: "inner-start / inner-end" }} bordered={false} ghost>
            {result.data?.spareParts.map((part) => (
               <Collapse.Panel header={part.name} key={part.id}>
                  <Card size="small">
                     <p>
                        <strong>{t('Name')}:</strong> {part.name}
                     </p>
                     <p>
                        <strong>{t('ExpirationDate')}:</strong> {dayjs(part.expirationDate).format("DD/MM/YYYY")}
                     </p>
                     <div>
                        <p>
                           <strong>{t('Qty')}: </strong>
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
