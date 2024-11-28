import useNotifications_Seen from "@/features/common/mutations/Notifications_Seen.mutation"
import useNotifications_SeenAll from "@/features/common/mutations/Notifications_SeenAll.mutation"

const global_mutations = {
   notifications: {
      seen: useNotifications_Seen,
      seenAll: useNotifications_SeenAll,
   },
}

export default global_mutations