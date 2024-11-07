"use client"

import { useSimulationStore } from "@/app/simulation/(layout)/main-flow/store-provider"
import Card from "antd/es/card"
import Form from "antd/es/form"
import { InputNumber } from "antd"
import simulation_mutations from "@/features/simulation/mutations"
import Button from "antd/es/button"

function SelectCountsCard() {
   const store = useSimulationStore((store) => store)

   const mutate_createRequests = simulation_mutations.request.createManyAll()

   async function handleSubmit(no_fixRequests: number, no_warrantyRequests: number) {
      mutate_createRequests.mutate(
         {
            no_fix: no_fixRequests,
            no_warranty: no_warrantyRequests,
         },
         {
            onSuccess: (data) => {
               console.log(
                  data.fixRequests.map((req) => req.id),
                  data.warrantyRequests.map((req) => req.id),
               )
               store.update_idLists_fixRequest(data.fixRequests.map((req) => req.id))
               store.update_idLists_warrantyRequest(data.warrantyRequests.map((req) => req.id))
               store.update_counts_reset()
            },
         },
      )
   }

   return (
      <Card
         title="Vui lòng chọn số lượng yêu cầu cần tạo"
         actions={[
            <Button
               type="link"
               key="clear"
               onClick={store.update_counts_reset}
               className="w-full"
               disabled={store.counts_fixRequests === 0 && store.counts_warrantyRequests === 0}
            >
               Xóa
            </Button>,
            <Button
               type="link"
               key="submit"
               className="w-full"
               onClick={() => handleSubmit(store.counts_fixRequests, store.counts_warrantyRequests)}
               loading={mutate_createRequests.isPending}
               disabled={store.counts_fixRequests === 0 && store.counts_warrantyRequests === 0}
            >
               Giả lập yêu cầu
            </Button>,
         ]}
      >
         <div>
            <Form.Item label="Yêu cầu sửa chữa">
               <InputNumber
                  className="w-full"
                  value={store.counts_fixRequests}
                  onChange={store.update_counts_fixRequests}
                  min={0}
                  max={100}
               />
            </Form.Item>
            <Form.Item label="Yêu cầu bảo hành">
               <InputNumber
                  className="w-full"
                  value={store.counts_warrantyRequests}
                  onChange={store.update_counts_warrantyRequests}
                  min={0}
                  max={100}
               />
            </Form.Item>
         </div>
      </Card>
   )
}

export default SelectCountsCard
