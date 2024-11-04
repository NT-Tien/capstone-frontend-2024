import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { NotFoundError } from "@/lib/error/not-found.error"
import { ExportWarehouseDto } from "@/lib/domain/ExportWarehouse/ExportWarehouse.dto"

export type Request = {
   id: string
}
export type Response = ExportWarehouseDto

Stockkeeper_ExportWarehouse_OneById.URL = (req: Request) => `/stockkeeper/export-warehouse/${req.id}`
export default async function Stockkeeper_ExportWarehouse_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Stockkeeper_ExportWarehouse_OneById.URL(req), {
         transformResponse: (data) => {
            return parseApiResponse(data, (res) => {
               if (res.data === null) {
                  throw new NotFoundError("Not found")
               }

               return res.data
            })
         },
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
