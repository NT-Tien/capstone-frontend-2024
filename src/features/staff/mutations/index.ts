import useIssue_Failed from "@/features/staff/mutations/Issue_Failed.mutation"
import useTask_Finish from "@/features/staff/mutations/Task_Finish.mutation"
import useTask_BeginTask from "@/features/staff/mutations/Task_Begin.mutation"
import useIssue_Resolve from "@/features/staff/mutations/Issue_Resolve.mutation"
import useTask_Close from "@/features/staff/mutations/Task_Close.mutation"

const staff_mutations = {
   issues: {
      failed: useIssue_Failed,
      resolve: useIssue_Resolve,
   },
   task: { finish: useTask_Finish, begin: useTask_BeginTask, close: useTask_Close },
}

export default staff_mutations
