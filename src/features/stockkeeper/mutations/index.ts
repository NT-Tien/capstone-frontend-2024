import useTask_ReturnSpareParts from "@/features/stockkeeper/mutations/Task_ReturnSpareParts.mutation"
import useTask_Cancel from "@/features/stockkeeper/mutations/Task_Cancel.mutation"
import useIssueFail from "@/features/stockkeeper/mutations/Issue_Fail.mutation"
import useIssueFailMany from "@/features/stockkeeper/mutations/Issue_FailMany.mutation"

const stockkeeper_mutations = {
   task: {
      returnSpareParts: useTask_ReturnSpareParts,
      cancel: useTask_Cancel,
   },
   issue: {
      fail: useIssueFail,
      failMany: useIssueFailMany,
   },
}

export default stockkeeper_mutations
