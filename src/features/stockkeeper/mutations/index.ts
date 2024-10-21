import useTask_ReturnSpareParts from "@/features/stockkeeper/mutations/Task_ReturnSpareParts.mutation"
import useTask_Cancel from "@/features/stockkeeper/mutations/Task_Cancel.mutation"

const stockkeeper_mutations = {
   task: {
      returnSpareParts: useTask_ReturnSpareParts,
      cancel: useTask_Cancel,
   },
}

export default stockkeeper_mutations
