import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Stockkeeper_ExportWareHouse_Renew, { Request, Response }  from "../api/exports/export-renew.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useExportWareHouse_Renew.qk = (props: Props) => ["stockkeeper", "export-warehouse", "renew", props]
useExportWareHouse_Renew.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useExportWareHouse_Renew.qk(props),
   queryFn: () => Stockkeeper_ExportWareHouse_Renew(props),
})

function useExportWareHouse_Renew(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useExportWareHouse_Renew.queryOptions(props),
      ...queryOptions,
   })
}

export default useExportWareHouse_Renew
