import useTask_All from "@/features/staff/queries/Task_All.query"
import useTask_AllByDate from "@/features/staff/queries/Task_AllByDate.query"
import useTask_AllCounts from "@/features/staff/queries/Task_AllCounts.query"
import useTask_OneById from "@/features/staff/queries/Task_OneById.query"
import useNotifications_All from "@/features/staff/queries/Notifications_All.query"
import useTask_All_InProgress from "@/features/staff/queries/Task_All_InProgress.query"

const staff_queries = {
   task: {
      all: useTask_All,
      allByDate: useTask_AllByDate,
      allCounts: useTask_AllCounts,
      allInProgress: useTask_All_InProgress,
      one: useTask_OneById,
   },
   notifications: {
      all: useNotifications_All,
   },
}

export default staff_queries
