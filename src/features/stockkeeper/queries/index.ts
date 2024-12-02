import useExportWareHouse_All from "@/features/stockkeeper/queries/ExportWarehouse_All.query"
import useExportWareHouse_One from "@/features/stockkeeper/queries/ExportWarehouse_One.query"
import useExportWareHouse_Renew from "./ExportWarehouse_Renew.query"

const stockkeeper_queries = {
   exportWarehouse: {
      all: useExportWareHouse_All,
      oneById: useExportWareHouse_One,
      exportRenew: useExportWareHouse_Renew,
   },
}

export default stockkeeper_queries
