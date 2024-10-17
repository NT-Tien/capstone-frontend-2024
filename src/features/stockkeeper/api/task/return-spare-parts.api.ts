import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      stockkeeper_signature: string
      staff_signature: string
   }
} & AuthTokenWrapper
export type Response = TaskDto

Stockkeeper_Task_ReturnSpareParts.URL = (req: Request) => `/stockkeeper/task/return-spare-part/${req.id}`
export default async function Stockkeeper_Task_ReturnSpareParts(req: Request): Promise<Response> {
   return api
      .post<Response>(Stockkeeper_Task_ReturnSpareParts.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
