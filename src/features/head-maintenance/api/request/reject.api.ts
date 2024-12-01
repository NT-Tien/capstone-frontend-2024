import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      checker_note: string
   }
} & AuthTokenWrapper
export type Response = RequestDto

HeadStaff_Request_Reject.URL = (req: Request) => `/head-staff/request/reject/${req.id}`
export default async function HeadStaff_Request_Reject(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_Request_Reject.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
