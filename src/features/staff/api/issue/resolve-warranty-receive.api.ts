import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      receive_bill_images: string[]
      note: string
      warranty_status: "success" | "fail"
   }
} & AuthTokenWrapper
export type Response = TaskDto

Staff_Issue_ResolveWarrantyReceive.URL = (req: Request) => `/staff/issue/warranty/receive/${req.id}/resolved`
export default async function Staff_Issue_ResolveWarrantyReceive(req: Request): Promise<Response> {
   return api
      .put<Response>(Staff_Issue_ResolveWarrantyReceive.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
