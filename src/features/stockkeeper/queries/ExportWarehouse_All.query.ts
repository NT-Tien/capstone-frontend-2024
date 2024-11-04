import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Stockkeeper_ExportWareHouse_All, { Request, Response } from "@/features/stockkeeper/api/exports/all.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, string[]>

useExportWareHouse_All.qk = (props: Props) => ["stockkeeper", "export-warehouse", "all"]
useExportWareHouse_All.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useExportWareHouse_All.qk(props),
   queryFn: () => Stockkeeper_ExportWareHouse_All({}),
})

function useExportWareHouse_All(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useExportWareHouse_All.queryOptions(props),
      ...queryOptions,
   })
}

export default useExportWareHouse_All
