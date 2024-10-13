import { Divider, InputNumber, Modal, ModalProps } from "antd"
import { useState } from "react"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import simulation_mutations from "@/features/simulation/mutations"

type FixRequest_ApproveModalProps = {
   requests?: RequestDto[]
   handleFinish?: (
      requests: RequestDto[],
      no_issues: number,
      no_spareParts: number,
      no_approved: number,
      no_rejected: number,
   ) => void
}

type Props = Omit<ModalProps, "children"> & FixRequest_ApproveModalProps

function OldFixRequest_ApproveModal(props: Props) {
   const [no_issues, setNo_issues] = useState<number>(0)
   const [no_spareParts, setNo_spareParts] = useState<number>(0)
   const [no_approved, setNo_approved] = useState<number>(0)
   const [no_rejected, setNo_rejected] = useState<number>(0)

   return (
      <Modal
         title="Xác nhận yêu cầu"
         centered
         okText="Giả lập xác nhận yêu cầu"
         okButtonProps={{
            disabled:
               no_approved + no_rejected === 0 ||
               no_approved + no_rejected > (props.requests?.length ?? 0) ||
               (no_approved > 0 && no_issues === 0),
         }}
         onOk={() =>
            props.requests && props.handleFinish?.(props.requests, no_issues, no_spareParts, no_approved, no_rejected)
         }
         {...props}
      >
         <article className="grid grid-cols-2 gap-3">
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
         <Divider />
         <article className={"flex flex-col gap-2 *:flex *:flex-col *:gap-1"}>
            <div>
               <div>Số lượng lỗi</div>
               <InputNumber className="w-full" value={no_issues} onChange={(e) => setNo_issues(e ?? 0)} />
            </div>
            <div>
               <div>Số lượng linh kiện</div>
               <InputNumber className="w-full" value={no_spareParts} onChange={(e) => setNo_spareParts(e ?? 0)} />
            </div>
         </article>
      </Modal>
   )
}

export default OldFixRequest_ApproveModal
export type { FixRequest_ApproveModalProps }
