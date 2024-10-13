import { Divider, InputNumber, Modal, ModalProps } from "antd"
import { useState } from "react"
import Form from "antd/es/form"
import simulation_mutations from "@/features/simulation/mutations"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

type FixRequest_ApproveModalProps = {
   requests?: RequestDto[]
   onSuccess?: () => void
}
type Props = Omit<ModalProps, "children"> & FixRequest_ApproveModalProps

function FixRequest_ApproveModal(props: Props) {
   const [no_approved, setNo_approved] = useState<number>(0)
   const [no_rejected, setNo_rejected] = useState<number>(0)
   const [no_issues, setNo_issues] = useState<number>(3)
   const [no_spareParts, setNo_spareParts] = useState<number>(1)

   const mutate_requestApprove = simulation_mutations.request.approve()
   const mutate_requestReject = simulation_mutations.request.reject()

   function handleSubmit(
      requests: RequestDto[],
      no_approved: number,
      no_rejected: number,
      no_issues: number,
      no_spareParts: number,
   ) {
      mutate_requestApprove.mutate({
         requests: requests.slice(0, no_approved),
         numbers: {
            no_issues,
            no_spareParts,
         },
      })
      mutate_requestReject.mutate({
         requestIds: requests.slice(no_approved, no_approved + no_rejected).map((request) => request.id),
      })

      props.onSuccess?.()
   }

   return (
      <Modal
         title="Xác nhận yêu cầu"
         centered
         okText="Giả lập yêu cầu"
         onOk={() => {
            handleSubmit(props.requests ?? [], no_approved, no_rejected, no_issues, no_spareParts)
            props.onSuccess?.()
         }}
         {...props}
      >
         <section>
            <Form.Item label="Số lượng xác nhận">
               <InputNumber value={no_approved} onChange={(e) => setNo_approved(e ?? 0)} min={0} className="w-full" />
            </Form.Item>
            <Form.Item label="Số lượng không tiếp nhận">
               <InputNumber value={no_rejected} onChange={(e) => setNo_rejected(e ?? 0)} min={0} className="w-full" />
            </Form.Item>
         </section>
         <Divider />
         <section>
            <Form.Item label="Số lượng lỗi">
               <InputNumber value={no_issues} onChange={(e) => setNo_issues(e ?? 0)} min={0} className="w-full" />
            </Form.Item>
            <Form.Item label="Số lượng linh kiện">
               <InputNumber
                  value={no_spareParts}
                  onChange={(e) => setNo_spareParts(e ?? 0)}
                  min={0}
                  className="w-full"
               />
            </Form.Item>
         </section>
      </Modal>
   )
}

export default FixRequest_ApproveModal
export type { FixRequest_ApproveModalProps }
