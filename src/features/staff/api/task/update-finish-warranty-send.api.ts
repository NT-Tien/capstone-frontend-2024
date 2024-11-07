import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
} & AuthTokenWrapper
export type Response = TaskDto

Staff_Task_UpdateFinishWarrantySend.URL = (req: Request) => {
   return `/staff/task/complete/${req.id}/warranty`
}
export default async function Staff_Task_UpdateFinishWarrantySend(req: Request): Promise<Response> {
   return api
      .post<Response>(Staff_Task_UpdateFinishWarrantySend.URL(req), undefined, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
