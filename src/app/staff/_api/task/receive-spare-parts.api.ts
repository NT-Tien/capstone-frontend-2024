import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { TaskDto } from "@/lib/domain/Task/Task.dto"

export type Request = {
   id: string
}
export type Response = TaskDto

Staff_Task_ReceiveSpareParts.URL = (req: Request) => `/staff/task/receipt/${req.id}`
export default async function Staff_Task_ReceiveSpareParts(req: Request): Promise<Response> {
   return api
      .post<Response>(Staff_Task_ReceiveSpareParts.URL(req), undefined, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
