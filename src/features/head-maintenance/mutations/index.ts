import useCreateRenewRequestMutation from "@/features/head-maintenance/mutations/CreateRenewRequest.mutation"
import useIssue_Update from "@/features/head-maintenance/mutations/Issue_Update.mutation"
import useIssue_UpdateMany from "@/features/head-maintenance/mutations/Issue_UpdateMany.drawer"
import useIssueSparePart_ReplaceMany from "@/features/head-maintenance/mutations/IssueSparePart_Replace.mutation"
import useRequest_ApproveToFix from "@/features/head-maintenance/mutations/Request_ApproveToFix.mutation"
import useRequest_Reject from "@/features/head-maintenance/mutations/Request_Reject.mutation"
import useRequest_Seen from "@/features/head-maintenance/mutations/Request_Seen.mutation"
import useIssue_Cancel from "@/features/head-maintenance/mutations/Issue_Cancel.mutation"
import useIssueSparePart_Create from "@/features/head-maintenance/mutations/IssueSparePart_Create.mutation"
import useIssue_UpdateFull from "@/features/head-maintenance/mutations/Issue_UpdateFull.mutation"
import useTaskCancel from "@/features/head-maintenance/mutations/Task_Cancel.mutation"
import useRequest_ApproveToWarranty from "@/features/head-maintenance/mutations/Request_ApproveToWarranty.mutation"
import useRequest_Finish from "@/features/head-maintenance/mutations/Request_Finish.mutation"
import useTask_AssignFixer from "@/features/head-maintenance/mutations/Task_AssignFixer.mutation"
import useTaskUpdate from "@/features/head-maintenance/mutations/Task_Update.mutation"
import useTask_Close from "@/features/head-maintenance/mutations/Task_Close.mutation"
import useIssue_CreateMany from "@/features/head-maintenance/mutations/Issue_Create.mutation"
import useIssue_DetatchAndRecreateTaskWarranty from "@/features/head-maintenance/mutations/Issue_DetatchAndRecreateTaskWarranty.mutation"
import useRequest_ApproveToRenew from "./Request_ApproveToRenew.mutation"
import useRequest_WarrantyFailed from "@/features/head-maintenance/mutations/Request_WarrantyFailed.mutation"
import useRequest_UpdateWarrantyReturnDate from "@/features/head-maintenance/mutations/Request_UpdateWarrantyReturnDate.mutation"
import useRequest_ApproveToRenewEmptyDevice from "./Request_ApproveToRenewEmptyDevice.mutation"
import useTask_CreateExportWarehouse from "@/features/head-maintenance/mutations/Task_CreateExportWarehouse.mutation"
import useRequest_CreateReturnWarranty from "@/features/head-maintenance/mutations/Request_CreateReturnWarranty.mutation"
import useRequest_AddReplacementDevice from "@/features/head-maintenance/mutations/Request_AddReplacementDevice.mutation"

const head_maintenance_mutations = {
   request: {
      createRenewRequest: useCreateRenewRequestMutation,
      approveToFix: useRequest_ApproveToFix,
      approveToWarranty: useRequest_ApproveToWarranty,
      approveToRenew: useRequest_ApproveToRenew,
      approveToRenewEmptyDevice: useRequest_ApproveToRenewEmptyDevice,
      reject: useRequest_Reject,
      seen: useRequest_Seen,
      finish: useRequest_Finish,
      warrantyFailed: useRequest_WarrantyFailed,
      updateWarrantyReturnDate: useRequest_UpdateWarrantyReturnDate,
      createReturnWarranty: useRequest_CreateReturnWarranty,
      addReplacementDevice: useRequest_AddReplacementDevice,
   },
   issue: {
      update: useIssue_Update,
      updateMany: useIssue_UpdateMany,
      updateFull: useIssue_UpdateFull,
      cancel: useIssue_Cancel,
      createMany: useIssue_CreateMany,
      detatchAndRecreateTaskWarranty: useIssue_DetatchAndRecreateTaskWarranty,
   },
   issueSparePart: {
      replaceMany: useIssueSparePart_ReplaceMany,
      create: useIssueSparePart_Create,
   },
   task: {
      cancel: useTaskCancel,
      assignFixer: useTask_AssignFixer,
      update: useTaskUpdate,
      close: useTask_Close,
      createExportWarehouse: useTask_CreateExportWarehouse,
   },
}

export default head_maintenance_mutations
