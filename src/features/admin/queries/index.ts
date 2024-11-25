import useRequest_AllQuery from "@/features/admin/queries/Request_All.query"
import useRequest_AllFilteredAndSortedQuery from "@/features/admin/queries/Request_AllFilterAndSort.query"
import useMachineModel_AllQuery from "@/features/admin/queries/MachineModel_All.query"
import useRequest_One from "@/features/admin/queries/Request_One.query"
import useArea_AllQuery from "@/features/admin/queries/Area_All.query"
import useTask_AllFilteredAndSortedQuery from "@/features/admin/queries/Task_AllFilterAndSort.query"
import useTask_One from "@/features/admin/queries/Task_One.query"
import useUser_AllQuery from "@/features/admin/queries/User_All.query"
import useUser_One from "@/features/admin/queries/User_One.query"
import useArea_One from "@/features/admin/queries/Area_One.query"
import useDevice_AllFilteredAndSortedQuery from "@/features/admin/queries/Device.AllFilterAndSort.query"
import useMachineModel_OneQuery from "@/features/admin/queries/MachineModel_One.query"
import useDevice_One from "@/features/admin/queries/Device_One.query"
import useRequest_ManyByIdQuery from "@/features/admin/queries/Request_ManyById.query"
import useSparePart_AllQuery from "./SparePart_All.query"
import useSparePart_AllFilterAndSortedQuery from "./SparePart_AllFilterAndSort.query"
import useSparePart_One from "./SparePart_One.query"
import useTypeError_One from "./TypeError_One.query"
import useDevice_AllQuery from "./Device_All.query"

const admin_queries = {
   request: {
      all: useRequest_AllQuery,
      all_filterAndSort: useRequest_AllFilteredAndSortedQuery,
      one: useRequest_One,
      manyByIds: useRequest_ManyByIdQuery,
   },
   ticket: {
      all: useRequest_AllQuery,
      all_filterAndSort: useRequest_AllFilteredAndSortedQuery,
      one: useRequest_One,
      manyByIds: useRequest_ManyByIdQuery,
   },
   machine_model: {
      all: useMachineModel_AllQuery,
      one: useMachineModel_OneQuery,
   },
   area: {
      all: useArea_AllQuery,
      one: useArea_One,
   },
   task: {
      all_filterAndSort: useTask_AllFilteredAndSortedQuery,
      one: useTask_One,
   },
   user: {
      all: useUser_AllQuery,
      one: useUser_One,
   },
   device: {
      all_filterAndSort: useDevice_AllFilteredAndSortedQuery,
      one: useDevice_One,
      all: useDevice_AllQuery,
   },
   spare_part: {
      all: useSparePart_AllQuery,
      all_filterAndSort: useSparePart_AllFilterAndSortedQuery,
      one: useSparePart_One,
   },
   type_error: {
      all_filterAndSort: useTask_AllFilteredAndSortedQuery,
      one: useTypeError_One,
   }
}

export default admin_queries
