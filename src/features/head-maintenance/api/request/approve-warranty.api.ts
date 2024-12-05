import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      note: string
      replacement_machineModel_id?: string
      isMultiple?: boolean
   }
} & AuthTokenWrapper
export type Response = RequestDto

HeadStaff_Request_ApproveWarranty.URL = (req: Request) => {
   const urlSearchParams = new URLSearchParams()
   if (req.payload.isMultiple) {
      urlSearchParams.append("isMultiple", "true")
   }

   return (
      `/head-staff/request/approve-warranty/${req.id}` + (urlSearchParams.toString() ? `?${urlSearchParams.toString()}` : "")
   )
}
export default async function HeadStaff_Request_ApproveWarranty(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_Request_ApproveWarranty.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
