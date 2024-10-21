import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      reason: string
   }
} & AuthTokenWrapper
export type Response = TaskDto

Stockkeeper_Task_Cancel.URL = (req: Request) => `/stockkeeper/task/cancel/${req.id}`
export default async function Stockkeeper_Task_Cancel(req: Request): Promise<Response> {
   return api
      .post<Response>(Stockkeeper_Task_Cancel.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
