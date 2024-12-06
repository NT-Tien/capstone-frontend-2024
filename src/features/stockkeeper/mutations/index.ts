import useTask_ReturnSpareParts from "@/features/stockkeeper/mutations/Task_ReturnSpareParts.mutation"
import useTask_Cancel from "@/features/stockkeeper/mutations/Task_Cancel.mutation"
import useIssueFail from "@/features/stockkeeper/mutations/Issue_Fail.mutation"
import useIssueFailMany from "@/features/stockkeeper/mutations/Issue_FailMany.mutation"
import useExportWarehouse_Accept from "@/features/stockkeeper/mutations/ExportWarehouse_Accept.mutation"
import useExportWarehouse_Delay from "@/features/stockkeeper/mutations/ExportWarehouse_Delay.mutation"
import useDevice_ReturnRemovedDevice from "./Device_ReturnRemovedDevice.mutation"
import useSparePart_UpdateQuantity from "@/features/stockkeeper/mutations/SparePart_UpdateQuantity.mutation"
import useSparePart_AddQuantity from "./SparePart_AddQuantity.mutation"

const stockkeeper_mutations = {
   task: {
      returnSpareParts: useTask_ReturnSpareParts,
      cancel: useTask_Cancel,
   },
   issue: {
      fail: useIssueFail,
      failMany: useIssueFailMany,
   },
   exportWarehouse: {
      accept: useExportWarehouse_Accept,
      delay: useExportWarehouse_Delay,
   },
   device: {
      returnRemovedDevice: useDevice_ReturnRemovedDevice,
   },
   sparePart: {
      updateQuantity: useSparePart_UpdateQuantity,
      addQuantity: useSparePart_AddQuantity,
   },
}

export default stockkeeper_mutations
