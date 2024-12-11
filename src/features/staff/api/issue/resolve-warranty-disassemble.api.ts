import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      imagesVerify: string[]
      videosVerify?: string
      resolvedNote?: string
   }
} & AuthTokenWrapper
export type Response = TaskDto

Staff_Issue_ResolveWarrantyDisassemble.URL = (req: Request) => `/staff/issue/warrranty/disassemble/${req.id}/resolved`
export default async function Staff_Issue_ResolveWarrantyDisassemble(req: Request): Promise<Response> {
   return api
      .put<Response>(Staff_Issue_ResolveWarrantyDisassemble.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
