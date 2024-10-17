import useIssue_Failed from "@/features/staff/mutations/Issue_Failed.mutation"
import useTask_Finish from "@/features/staff/mutations/Task_Finish.mutation"

const staff_mutations = {
   issues: {
      failed: useIssue_Failed,
   },
   task: { finish: useTask_Finish },
}

export default staff_mutations
