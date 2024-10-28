import useTask_All from "@/features/staff/queries/Task_All.query"
import useTask_AllByDate from "@/features/staff/queries/Task_AllByDate.query"
import useTask_AllCounts from "@/features/staff/queries/Task_AllCounts.query"
import useTask_OneById from "@/features/staff/queries/Task_OneById.query"

const staff_queries = {
   task: {
      all: useTask_All,
      allByDate: useTask_AllByDate,
      allCounts: useTask_AllCounts,
      one: useTask_OneById,
   },
}

export default staff_queries
