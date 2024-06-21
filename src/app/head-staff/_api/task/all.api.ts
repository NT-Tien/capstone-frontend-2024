import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus } from "@/common/enum/task-status.enum"

export type Request = {
   page: number
   limit: number
   status: TaskStatus
}
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
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
