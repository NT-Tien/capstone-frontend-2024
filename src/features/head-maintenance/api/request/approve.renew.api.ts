import api from "@/config/axios.config"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = {
   id: string
   payload: {
      deviceId: string | null
      note: string
      isMultiple?: boolean
   }
} & AuthTokenWrapper
export type Response = RequestDto

HeadStaff_Request_ApproveRenew.URL = (req: Request) => {
   const urlSearchParams = new URLSearchParams()
   if (req.payload.isMultiple) {
      urlSearchParams.append("isMultiple", "true")
   }

   return (
      `/head-staff/request/approve-renew/${req.id}` +
      (urlSearchParams.toString() ? `?${urlSearchParams.toString()}` : "")
   )
}
export default async function HeadStaff_Request_ApproveRenew(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_Request_ApproveRenew.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
