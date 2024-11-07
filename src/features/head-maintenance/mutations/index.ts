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
import useNotifications_Seen from "@/features/head-maintenance/mutations/Notifications_Seen.mutation"
import useRequest_ApproveToWarranty from "@/features/head-maintenance/mutations/Request_ApproveToWarranty.mutation"
import useRequest_Finish from "@/features/head-maintenance/mutations/Request_Finish.mutation"
import useTask_AssignFixer from "@/features/head-maintenance/mutations/Task_AssignFixer.mutation"
import useTaskUpdate from "@/features/head-maintenance/mutations/Task_Update.mutation"
import useTask_Close from "@/features/head-maintenance/mutations/Task_Close.mutation"
import useIssue_CreateMany from "@/features/head-maintenance/mutations/Issue_Create.mutation"
import useIssue_DetatchAndRecreateTaskWarranty from "@/features/head-maintenance/mutations/Issue_DetatchAndRecreateTaskWarranty.mutation"

const head_maintenance_mutations = {
   request: {
      createRenewRequest: useCreateRenewRequestMutation,
      approveToFix: useRequest_ApproveToFix,
      approveToWarranty: useRequest_ApproveToWarranty,
      reject: useRequest_Reject,
      seen: useRequest_Seen,
      finish: useRequest_Finish,
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
   },
   notifications: {
      seen: useNotifications_Seen,
   },
}

export default head_maintenance_mutations
