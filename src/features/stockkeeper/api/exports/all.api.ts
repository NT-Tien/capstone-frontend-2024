import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { ExportWarehouseDto } from "@/lib/domain/ExportWarehouse/ExportWarehouse.dto"

export type Request = {}
export type Response = ExportWarehouseDto[]

Stockkeeper_ExportWareHouse_All.URL = () => `/stockkeeper/export-warehouse`
export default async function Stockkeeper_ExportWareHouse_All(req: Request): Promise<Response> {
   return api
      .get<Response>(Stockkeeper_ExportWareHouse_All.URL(), {
         transformResponse: (data) => parseApiResponse<any>(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
