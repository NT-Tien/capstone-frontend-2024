import useIssue_Failed from "@/features/staff/mutations/Issue_Failed.mutation"
import useTask_Finish from "@/features/staff/mutations/Task_Finish.mutation"
import useTask_BeginTask from "@/features/staff/mutations/Task_Begin.mutation"
import useIssue_Resolve from "@/features/staff/mutations/Issue_Resolve.mutation"
import useTask_Close from "@/features/staff/mutations/Task_Close.mutation"
import useRequest_UpdateWarrantyDate from "@/features/staff/mutations/Request_UpdateWarrantyDate.mutation"
import useIssue_ResolveSendWarranty from "@/features/staff/mutations/Issue_ResolveSendWarranty.mutation"
import useTask_FinishWarrantySend from "@/features/staff/mutations/Task_Finish_WarrantySend.mutation"
import useIssue_FailedWarranty from "@/features/staff/mutations/Issue_FailedWarranty.mutation"
import useIssue_ResolveDisassembleWarranty from "@/features/staff/mutations/Issue_ResolveWarrantyDisassemble.mutation"
import useIssue_ResolveInstallReplacementWarranty from "@/features/staff/mutations/Issue_ResolveWarrantyInstallReplacement.api"
import useIssue_ResolveReceiveWarranty from "@/features/staff/mutations/Issue_ResolveWarrantyReceive.mutation"

const staff_mutations = {
   issues: {
      failed: useIssue_Failed,
      failedWarranty: useIssue_FailedWarranty,
      resolve: useIssue_Resolve,
      resolveSendWarranty: useIssue_ResolveSendWarranty,
      resolveDisassembleWarranty: useIssue_ResolveDisassembleWarranty,
      resolveInstallReplacementWarranty: useIssue_ResolveInstallReplacementWarranty,
      resolveReceiveWarranty: useIssue_ResolveReceiveWarranty,
   },
   request: {
      updateWarrantyDate: useRequest_UpdateWarrantyDate,
   },
   task: {
      finish: useTask_Finish,
      begin: useTask_BeginTask,
      close: useTask_Close,
      finishWarrantySend: useTask_FinishWarrantySend,
   },
}

export default staff_mutations
