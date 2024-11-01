import useAddRequestFeedbackMutation from "@/features/head-department/mutations/AddRequestFeedback.mutation"
import useCancelRequestMutation from "@/features/head-department/mutations/CancelRequest.mutation"
import useCreateRequestMutation from "@/features/head-department/mutations/CreateRequest.mutation"
import useNotifications_Seen from "@/features/head-department/mutations/Notifications_Seen.mutation"

const head_department_mutations = {
   request: {
      addFeedback: useAddRequestFeedbackMutation,
      cancelRequest: useCancelRequestMutation,
      createRequest: useCreateRequestMutation,
   },
   notifications: {
      seen: useNotifications_Seen,
   },
}

export default head_department_mutations
