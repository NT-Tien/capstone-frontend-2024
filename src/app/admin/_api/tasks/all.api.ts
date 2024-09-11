import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

export type Task = {
   page: number
   limit: number
   status: TaskStatus
   time: 1 | 2 | 3
}
type Response = {
    list: TaskDto[]
    total: number
}

Admin_Tasks_All.URL = ({ page, limit, status, time = 1 }: Task) =>
   `/admin/task/${page}/${limit}/${status}?time=${time}`
export default async function Admin_Tasks_All(request: Task): Promise<Response> {
   return api
      .get<Response>(Admin_Tasks_All.URL(request), {
         transformResponse: (data) =>
            parseApiResponse<any>(data, (res) => ({
               list: res.data[0],
               total: res.data[1],
            })),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
