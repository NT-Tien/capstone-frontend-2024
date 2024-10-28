import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   start_date: string
   end_date: string
} & AuthTokenWrapper
export type Response = TaskDto[]

async function Staff_Task_AllByDate(req: Request): Promise<Response> {
   return api
      .get<Response>(Staff_Task_AllByDate.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

Staff_Task_AllByDate.URL = (req: Request) => {
   const urlSearchParams = new URLSearchParams()
   urlSearchParams.append("start_date", req.start_date)
   urlSearchParams.append("end_date", req.end_date)

   return "/staff/task/all-by-date" + "?" + urlSearchParams.toString()
}

export default Staff_Task_AllByDate
