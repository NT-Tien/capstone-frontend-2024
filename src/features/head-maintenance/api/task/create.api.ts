import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { Dayjs } from "dayjs"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = Pick<TaskDto, "name" | "priority" | "operator" | "totalTime"> & {
   fixerDate?: string
   fixer?: string
   request: string
   issueIDs: string[]
   type?: string
} & AuthTokenWrapper
export type Response = TaskDto

HeadStaff_Task_Create.URL = "/head-staff/task"
export default async function HeadStaff_Task_Create(req: Request): Promise<Response> {
   req.type = "DEFAULT"
   return api
      .post<Response>(HeadStaff_Task_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
