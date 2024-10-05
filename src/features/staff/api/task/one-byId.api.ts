import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { NotFoundError } from "@/lib/error/not-found.error"
import { TaskDto } from "@/lib/domain/Task/Task.dto"

export type Request = {
   id: string
}
export type Response = TaskDto

Staff_Task_OneById.URL = (req: Request) => `/staff/task/${req.id}`
export default async function Staff_Task_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Staff_Task_OneById.URL(req), {
         transformResponse: (data) =>
            parseApiResponse(data, (res) => {
               if (res.data === null) {
                  throw new NotFoundError("Device not found")
               }

               return res.data
            }),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
