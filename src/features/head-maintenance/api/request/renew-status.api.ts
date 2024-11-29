import api from "@/config/axios.config"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = { id: string } & AuthTokenWrapper
export type Response = DeviceDto

HeadStaff_Request_RenewStatus.URL = (req: Request) => `/head-staff/request/renew-status/${req.id}`
export default async function HeadStaff_Request_RenewStatus(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Request_RenewStatus.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}