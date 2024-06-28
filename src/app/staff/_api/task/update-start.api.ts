import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/common/dto/Task.dto"

export type Request = {
   id: string
}
export type Response = TaskDto

Staff_Task_UpdateStart.URL = (req: Request) => `/staff/task/in-progress/${req.id}`
export default async function Staff_Task_UpdateStart(req: Request): Promise<Response> {
   return api
      .post<Response>(Staff_Task_UpdateStart.URL(req), undefined, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
