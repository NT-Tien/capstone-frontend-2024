import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/common/dto/Task.dto"

export type Request = {
   id: string
   payload: Pick<TaskDto, "name" | "priority" | "operator" | "totalTime" | "status">
}
export type Response = TaskDto

HeadStaff_Task_Update.URL = (req: Request) => `/head-staff/task/${req.id}`
export default async function HeadStaff_Task_Update(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_Task_Update.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}