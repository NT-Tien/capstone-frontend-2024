import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      warrantyDate: string
   }
} & AuthTokenWrapper
export type Response = TaskDto

Staff_Request_UpdateWarrantyDate.URL = (req: Request) => `/staff/request/update-warranty-date/${req.id}`
export default async function Staff_Request_UpdateWarrantyDate(req: Request): Promise<Response> {
   return api
      .put<Response>(Staff_Request_UpdateWarrantyDate.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
