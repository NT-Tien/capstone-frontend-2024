import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: Partial<
      Pick<TaskDto, "name" | "priority" | "operator" | "totalTime" | "status" | "fixerDate"> & {
         fixer: string
      }
   >
} & AuthTokenWrapper
export type Response = TaskDto

HeadStaff_Task_Update.URL = (req: Request) => `/head-staff/task/${req.id}`
export default async function HeadStaff_Task_Update(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_Task_Update.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
