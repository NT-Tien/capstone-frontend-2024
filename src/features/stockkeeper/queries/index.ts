import useExportWareHouse_All from "@/features/stockkeeper/queries/ExportWarehouse_All.query"
import useExportWareHouse_One from "@/features/stockkeeper/queries/ExportWarehouse_One.query"

const stockkeeper_queries = {
   exportWarehouse: {
      all: useExportWareHouse_All,
      oneById: useExportWareHouse_One,
   },
}

export default stockkeeper_queries
