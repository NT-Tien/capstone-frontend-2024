import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"

export type Request = {
   spareParts: {
      sparePartName: string
      quantity: number
      machineModelName: string
   }[]
}
export type Response = {
    success: SparePartDto[],
    failed: any[]
}

Stockkeeper_SparePart_UpdateMany.URL = () => `/stockkeeper/spare-part/import`
export default async function Stockkeeper_SparePart_UpdateMany(req: Request): Promise<Response> {
   return api
      .post<Response>(Stockkeeper_SparePart_UpdateMany.URL(), req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
