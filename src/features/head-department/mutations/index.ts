import useAddRequestFeedbackMutation from "@/features/head-department/mutations/AddRequestFeedback.mutation"
import useCancelRequestMutation from "@/features/head-department/mutations/CancelRequest.mutation"
import useCreateRequestMutation from "@/features/head-department/mutations/CreateRequest.mutation"

const head_department_mutations = {
   request: {
      addFeedback: useAddRequestFeedbackMutation,
      cancelRequest: useCancelRequestMutation,
      createRequest: useCreateRequestMutation,
   },
}

export default head_department_mutations
