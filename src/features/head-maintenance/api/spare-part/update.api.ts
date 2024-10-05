import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      issue?: string
      sparePart?: string
      quantity?: number
   }
} & AuthTokenWrapper
export type Response = RequestDto

HeadStaff_SparePart_Update.URL = (req: Request) => `/head-staff/issue-spare-part/${req.id}`
export default async function HeadStaff_SparePart_Update(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_SparePart_Update.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
