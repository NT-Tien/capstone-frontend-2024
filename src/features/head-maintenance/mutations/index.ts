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

const head_maintenance_mutations = {
   request: {
      createRenewRequest: useCreateRenewRequestMutation,
      approveToFix: useRequest_ApproveToFix,
      reject: useRequest_Reject,
      seen: useRequest_Seen,
   },
   issue: {
      update: useIssue_Update,
      updateMany: useIssue_UpdateMany,
      updateFull: useIssue_UpdateFull,
      cancel: useIssue_Cancel,
   },
   issueSparePart: {
      replaceMany: useIssueSparePart_ReplaceMany,
      create: useIssueSparePart_Create,
   },
}

export default head_maintenance_mutations
