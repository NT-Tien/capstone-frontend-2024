import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/common/dto/Task.dto"

export type Request = Pick<TaskDto, "name" | "priority" | "operator" | "totalTime"> & {
   request: string
}
export type Response = TaskDto

HeadStaff_Task_Create.URL = "/head-staff/task"
export default async function HeadStaff_Task_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(HeadStaff_Task_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
