import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"

export type Request = {
   id: string
   payload: {
      fixerNote: string
      imagesVerify: string[]
      videosVerify: string
   }
}
export type Response = TaskDto

Staff_Task_UpdateFinish.URL = (req: Request) => `/staff/task/complete/${req.id}`
export default async function Staff_Task_UpdateFinish(req: Request): Promise<Response> {
   return api
      .post<Response>(Staff_Task_UpdateFinish.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
