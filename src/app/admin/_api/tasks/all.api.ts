import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

export type Task = {
   page: number
   limit: number
   status: TaskStatus
   time: 1 | 2 | 3
}
type Response = TaskDto[]

Admin_Tasks_All.URL = ({ page, limit, status, time = 1 }: Task) =>
   `/admin/task/${page}/${limit}/${status}?time=${time}&all=true`
export default async function Admin_Tasks_All(request: Task): Promise<Response> {
   return api
      .get<Response>(Admin_Tasks_All.URL(request), {
         transformResponse: (data) => parseApiResponse<any>(data, (res) => res.data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
