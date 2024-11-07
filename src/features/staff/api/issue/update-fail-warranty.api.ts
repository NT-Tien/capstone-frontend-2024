import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      failReason: string
      taskId: string
      imagesVerify?: string[]
   }
} & AuthTokenWrapper
export type Response = TaskDto

Staff_Issue_UpdateFailedWarranty.URL = (req: Request) => `/staff/issue/warranty/${req.id}/failed`
export default async function Staff_Issue_UpdateFailedWarranty(req: Request): Promise<Response> {
   return api
      .put<Response>(Staff_Issue_UpdateFailedWarranty.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
