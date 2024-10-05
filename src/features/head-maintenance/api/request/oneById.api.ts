import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { NotFoundError } from "@/lib/error/not-found.error"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
} & AuthTokenWrapper
export type Response = RequestDto

HeadStaff_Request_OneById.URL = (req: Request) => `/head-staff/request/${req.id}`
export default async function HeadStaff_Request_OneById(req: Request): Promise<Response> {
   const res = await api.get<Response>(HeadStaff_Request_OneById.URL(req), {
      transformResponse: (data) =>
         parseApiResponse(data, (res) => {
            return res.data
         }),
      headers: {
         Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
      },
   })

   return res.data
}
