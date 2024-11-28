import useNotifications_All from "@/features/common/queries/Notifications_All.query"
import useNotifications_UnseenCount from "@/features/common/queries/Notifications_UnseenCount.query"

const global_queries = {
   notifications: {
      all: useNotifications_All,
      unseen_count: useNotifications_UnseenCount,
   },
}

export default global_queries
