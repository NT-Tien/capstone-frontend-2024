import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/common/dto/Task.dto"

export type Request = { id: string }
export type Response = TaskDto

HeadStaff_Task_OneById.URL = (req: Request) => `/head-staff/task/${req.id}`
export default async function HeadStaff_Task_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Task_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
