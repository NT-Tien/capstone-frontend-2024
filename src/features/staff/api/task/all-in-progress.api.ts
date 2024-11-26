import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {} & AuthTokenWrapper
export type Response = TaskDto[]

async function Staff_Task_AllInProgress(req: Request): Promise<Response> {
   return api
      .get<Response>(Staff_Task_AllInProgress.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

Staff_Task_AllInProgress.URL = (req: Request) => {
   return "/staff/task/all/in-progress"
}

export default Staff_Task_AllInProgress
