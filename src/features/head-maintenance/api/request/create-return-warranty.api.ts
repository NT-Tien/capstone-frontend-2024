import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      fixer: string
      fixerDate: string
      priority: boolean
   }
} & AuthTokenWrapper
export type Response = RequestDto

HeadStaff_Request_CreateReturnWarranty.URL = (req: Request) => `/head-staff/request/create-return-warranty/${req.id}`

export default async function HeadStaff_Request_CreateReturnWarranty(req: Request): Promise<Response> {
   return api
      .post<Response>(HeadStaff_Request_CreateReturnWarranty.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
