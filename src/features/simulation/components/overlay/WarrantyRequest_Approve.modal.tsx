"use client"

import { InputNumber, Modal, ModalProps } from "antd"
import { useState } from "react"
import simulation_mutations from "@/features/simulation/mutations"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

type WarrantyRequest_ApprovalModalProps = {
   requests?: RequestDto[]
   onSuccess?: () => void
   handleFinish?: (no_approved: number, no_rejected: number) => void
}

type Props = Omit<ModalProps, "children"> & WarrantyRequest_ApprovalModalProps

function WarrantyRequest_ApproveModal(props: Props) {
   const [no_approved, setNo_approved] = useState<number>(0)
   const [no_rejected, setNo_rejected] = useState<number>(0)

   const mutate_approveRequest = simulation_mutations.request.approveWarranty()
   const mutate_rejectRequest = simulation_mutations.request.reject()

   async function handleSubmit(requests: RequestDto[], no_approved: number, no_rejected: number) {
      await mutate_approveRequest.mutateAsync({
         requests: requests.slice(0, no_approved),
      })

      await mutate_rejectRequest.mutateAsync({
         requestIds: requests.slice(no_approved, no_approved + no_rejected).map((req) => req.id),
      })

      props.onSuccess?.()
   }

   return (
      <Modal
         title="Xác nhận yêu cầu bảo hành"
         centered
         okText="Giả lập xác nhận"
         onOk={() => handleSubmit(props.requests ?? [], no_approved, no_rejected)}
         okButtonProps={{
            disabled: no_approved === 0 && no_rejected === 0,
         }}
         {...props}
      >
         <article className="grid grid-cols-1 gap-3">
            <section className="flex flex-col gap-2 *:flex *:flex-col *:gap-1">
               <div>
                  <div>Số lượng xác nhận</div>
                  <InputNumber className="w-full" value={no_approved} onChange={(e) => setNo_approved(e ?? 0)} />
               </div>
            </section>
            <section>
               <div>
                  <div>Số lượng từ chối</div>
                  <InputNumber className="w-full" value={no_rejected} onChange={(e) => setNo_rejected(e ?? 0)} />
               </div>
            </section>
         </article>
      </Modal>
   )
}

export default WarrantyRequest_ApproveModal
export type { WarrantyRequest_ApprovalModalProps }
