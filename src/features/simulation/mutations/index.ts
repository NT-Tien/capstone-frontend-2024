import useRequest_CreateMany from "@/features/simulation/mutations/Request_CreateMany.mutation"
import useRequest_UpdateSeen from "@/features/simulation/mutations/Request_UpdateSeen.mutation"
import useRequest_Approve from "@/features/simulation/mutations/Request_Approve.mutation"
import useRequest_Reject from "@/features/simulation/mutations/Request_Reject.mutation"
import useRequest_ApproveWarranty from "@/features/simulation/mutations/Request_ApproveWarranty.mutation"
import useTask_AssignFixer from "@/features/simulation/mutations/Task_Assign.mutation"
import useTask_Finish from "@/features/simulation/mutations/Task_Finish.mutation"
import useTask_VerifyWarrantySendComplete from "@/features/simulation/mutations/Task_VerifyWarrantySendComplete.mutation"
import useRequest_Close from "@/features/simulation/mutations/Request_Close.mutation"
import useRequest_CreateManyWarranty from "@/features/simulation/mutations/Request_CreateManyWarranty.mutation"
import useTask_Start from "@/features/simulation/mutations/Task_Start.mutation"
import useTask_HeadMaintenanceConfirm from "@/features/simulation/mutations/Task_HeadMaintenanceConfirm.mutation"
import useRequest_Feedback from "@/features/simulation/mutations/Request_Feedback.mutation"
import useRequest_CreateSendWarrantyTasks from "@/features/simulation/mutations/Request_CreateSendWarrantyTasks.mutation"
import useRequest_CreateReceiveWarrantyTasks from "@/features/simulation/mutations/Request_CreateReceiveWarrantyTasks.mutation"
import useRequest_CreateManyAll from "@/features/simulation/mutations/Request_CreateManyAll.mutation"
import useRequest_CreateTasks from "@/features/simulation/mutations/Request_CreateTasks.mutation"
import useTask_ConfirmReceipt from "@/features/simulation/mutations/Task_ConfirmReceipt.mutation"

const simulation_mutations = {
   request: {
      createManyAll: useRequest_CreateManyAll,
      createMany: useRequest_CreateMany,
      createManyWarranty: useRequest_CreateManyWarranty,
      updateSeen: useRequest_UpdateSeen,
      approve: useRequest_Approve,
      reject: useRequest_Reject,
      approveWarranty: useRequest_ApproveWarranty,
      close: useRequest_Close,
      feedback: useRequest_Feedback,
      createSendWarrantyTasks: useRequest_CreateSendWarrantyTasks,
      createReceiveWarrantyTasks: useRequest_CreateReceiveWarrantyTasks,
      createTasks: useRequest_CreateTasks,
   },
   task: {
      assignFixer: useTask_AssignFixer,
      finish: useTask_Finish,
      verifyWarrantySendComplete: useTask_VerifyWarrantySendComplete,
      start: useTask_Start,
      headMaintenanceConfirm: useTask_HeadMaintenanceConfirm,
      confirmReceipt: useTask_ConfirmReceipt,
   },
}

export default simulation_mutations
