import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"

export type Request = { id: string }
export type Response = TaskDto

Admin_Task_OneById.URL = (req: Request) => `/admin/task/${req.id}`
export default async function Admin_Task_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Task_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
