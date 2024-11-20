import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      issues: {
         typeError: string
         description: string
         fixType: string
         spareParts: {
            sparePart: string
            quantity: number
         }[]
      }[]
      isMultiple?: boolean
   }
} & AuthTokenWrapper
export type Response = RequestDto

HeadStaff_Request_ApproveFix.URL = (req: Request) => {
   const urlSearchParams = new URLSearchParams()
   if (req.payload.isMultiple) {
      urlSearchParams.append("isMultiple", "true")
   }

   return (
      `/head-staff/request/approve-fix/${req.id}` + (urlSearchParams.toString() ? `?${urlSearchParams.toString()}` : "")
   )
}
export default async function HeadStaff_Request_ApproveFix(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_Request_ApproveFix.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
