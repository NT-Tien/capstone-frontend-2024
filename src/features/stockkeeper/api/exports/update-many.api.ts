import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { ExportStatus } from "@/lib/domain/ExportWarehouse/ExportStatus.enum"

export type Request = {
   id: string
   payload: {
      status?: ExportStatus
      reason_delay?: string
      reason_cancel?: string
   }
} & AuthTokenWrapper
export type Response = {}

Stockkeeper_ExportWareHouse_Update.URL = (req: Request) => `/stockkeeper/export-warehouse/${req.id}`
export default async function Stockkeeper_ExportWareHouse_Update(req: Request): Promise<Response> {
   return api
      .put<Response>(Stockkeeper_ExportWareHouse_Update.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
