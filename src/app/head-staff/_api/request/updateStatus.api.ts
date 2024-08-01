import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"

export type Request = {
   id: string
   payload: {
      status?: FixRequestStatus
      checker_note?: string
      checker?: string
      checker_date?: string
      is_seen?: boolean
   }
}
export type Response = FixRequestDto

HeadStaff_Request_UpdateStatus.URL = (req: Request) => `/head-staff/request/${req.id}/status`
export default async function HeadStaff_Request_UpdateStatus(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_Request_UpdateStatus.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
