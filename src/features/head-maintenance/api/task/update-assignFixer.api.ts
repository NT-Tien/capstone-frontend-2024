import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      fixer: string
      fixerDate: string
      priority: boolean
   }
   shouldCreateExport?: boolean
} & AuthTokenWrapper
export type Response = TaskDto

HeadStaff_Task_UpdateAssignFixer.URL = (req: Request) => {
   const urlSearchParams = new URLSearchParams()

   if (req.shouldCreateExport) {
      urlSearchParams.append("shouldCreateExport", req.shouldCreateExport.toString())
   }

   return (
      `/head-staff/task/assign-fixer/${req.id}` + (urlSearchParams.toString() ? `?${urlSearchParams.toString()}` : "")
   )
}
export default async function HeadStaff_Task_UpdateAssignFixer(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_Task_UpdateAssignFixer.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
