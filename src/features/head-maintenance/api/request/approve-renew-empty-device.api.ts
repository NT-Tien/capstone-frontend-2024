import api from "@/config/axios.config"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = {
    id: string
    payload: {
       note: string
       isMultiple?: boolean
       machineModelId: string
    }
 } & AuthTokenWrapper
 export type Response = RequestDto

 HeadStaff_Request_ApproveRenewEmptyDevice.URL = (req: Request) => {
    const urlSearchParams = new URLSearchParams()
    if (req.payload.isMultiple) {
       urlSearchParams.append("isMultiple", "true")
    }
 
    return (
       `/head-staff/request/approve-renew-empty-device/${req.id}` +
       (urlSearchParams.toString() ? `?${urlSearchParams.toString()}` : "")
    )
 }
 export default async function HeadStaff_Request_ApproveRenewEmptyDevice(req: Request): Promise<Response> {
    return api
       .put<Response>(HeadStaff_Request_ApproveRenewEmptyDevice.URL(req), req.payload, {
          transformResponse: (data) => parseApiResponse(data),
          headers: {
             Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
          },
       })
       .then((res) => res.data)
 }