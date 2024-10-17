import useCreateRenewRequestMutation from "@/features/head-maintenance/mutations/CreateRenewRequest.mutation"
import useIssue_Update from "@/features/head-maintenance/mutations/Issue_Update.mutation"
import useIssue_UpdateMany from "@/features/head-maintenance/mutations/Issue_UpdateMany.drawer"
import useIssueSparePart_ReplaceMany from "@/features/head-maintenance/mutations/IssueSparePart_Replace.mutation"

const head_maintenance_mutations = {
   request: {
      createRenewRequest: useCreateRenewRequestMutation,
   },
   issue: {
      update: useIssue_Update,
      updateMany: useIssue_UpdateMany,
   },
   issueSparePart: {
      replaceMany: useIssueSparePart_ReplaceMany,
   },
}

export default head_maintenance_mutations
