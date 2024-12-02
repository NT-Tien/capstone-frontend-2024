import api from "@/config/axios.config"
import { ExportWarehouseDto } from "@/lib/domain/ExportWarehouse/ExportWarehouse.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = {
   id?: string
} & AuthTokenWrapper
export type Response = ExportWarehouseDto

Stockkeeper_ExportWareHouse_Renew.URL = (req: Request) => `/stockkeeper/export-warehouse/export-renew/${req.id}`
export default async function Stockkeeper_ExportWareHouse_Renew(req: Request): Promise<Response> {
   return api
      .put<Response>(Stockkeeper_ExportWareHouse_Renew.URL(req), {
         transformResponse: (data: string) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
