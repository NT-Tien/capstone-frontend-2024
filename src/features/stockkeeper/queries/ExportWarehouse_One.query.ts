import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Stockkeeper_ExportWarehouse_OneById, { Request, Response } from "@/features/stockkeeper/api/exports/one.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useExportWareHouse_One.qk = (props: Props) => ["stockkeeper", "export-warehouse", "one", props]
useExportWareHouse_One.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useExportWareHouse_One.qk(props),
   queryFn: () => Stockkeeper_ExportWarehouse_OneById(props),
})

function useExportWareHouse_One(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useExportWareHouse_One.queryOptions(props),
      ...queryOptions,
   })
}

export default useExportWareHouse_One
