import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   page: number
   limit: number
   status: TaskStatus
} & AuthTokenWrapper
export type Response = {
   list: TaskDto[]
   total: number
}

HeadStaff_Task_All.URL = (req: Request) => `/head-staff/task/${req.page}/${req.limit}/${req.status}`
export default async function HeadStaff_Task_All(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Task_All.URL(req), {
         transformResponse: (data) =>
            parseApiResponse<any>(data, (res) => ({
               list: res.data[0],
               total: res.data[1],
            })),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
