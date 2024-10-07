import useRequest_CreateMany from "@/features/simulation/mutations/Request_CreateMany.mutation"
import useRequest_UpdateSeen from "@/features/simulation/mutations/Request_UpdateSeen.mutation"
import useRequest_Approve from "@/features/simulation/mutations/Request_Approve.mutation"
import useRequest_Reject from "@/features/simulation/mutations/Request_Reject.mutation"
import useRequest_ApproveWarranty from "@/features/simulation/mutations/Request_ApproveWarranty.mutation"
import useTask_AssignFixer from "@/features/simulation/mutations/Task_Assign.mutation"
import useTask_Start from "@/features/simulation/mutations/Task_Start.mutation"
import useTask_Finish from "@/features/simulation/mutations/Task_Finish.mutation"
import useTask_VerifyWarrantySendComplete from "@/features/simulation/mutations/Task_VerifyWarrantySendComplete.mutation"
import useRequest_Close from "@/features/simulation/mutations/Request_Close.mutation"

const simulation_mutations = {
   request: {
      createMany: useRequest_CreateMany,
      updateSeen: useRequest_UpdateSeen,
      approve: useRequest_Approve,
      reject: useRequest_Reject,
      approveWarranty: useRequest_ApproveWarranty,
      close: useRequest_Close,
   },
   task: {
      assignFixer: useTask_AssignFixer,
      finish: useTask_Finish,
      verifyWarrantySendComplete: useTask_VerifyWarrantySendComplete,
   },
}

export default simulation_mutations
