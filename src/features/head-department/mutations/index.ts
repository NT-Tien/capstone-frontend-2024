import useAddRequestFeedbackMutation from "@/features/head-department/mutations/AddRequestFeedback.mutation"
import useCancelRequestMutation from "@/features/head-department/mutations/CancelRequest.mutation"
import useCreateRequestMutation from "@/features/head-department/mutations/CreateRequest.mutation"
import useRequest_Feedback from "@/features/head-department/mutations/Request_Feedback.mutation"

const head_department_mutations = {
   request: {
      addFeedback: useAddRequestFeedbackMutation,
      cancelRequest: useCancelRequestMutation,
      createRequest: useCreateRequestMutation,
      feedback: useRequest_Feedback,
   },
}

export default head_department_mutations
