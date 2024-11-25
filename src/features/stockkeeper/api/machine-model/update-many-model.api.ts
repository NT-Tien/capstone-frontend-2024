import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   model: {
      modelName: string
      quantity: number
      description: string
   }[]
} & AuthTokenWrapper
export type Response = {
   success: DeviceDto[]
   failed: any[]
}

Stockkeeper_Model_UpdateMany.URL = () => `/stockkeeper/machine-model/import`
export default async function Stockkeeper_Model_UpdateMany(req: Request): Promise<Response> {
   return api
      .post<Response>(Stockkeeper_Model_UpdateMany.URL(), req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}