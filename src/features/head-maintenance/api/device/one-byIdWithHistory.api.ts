import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = { id: string } & AuthTokenWrapper
export type Response = DeviceDto

HeadStaff_Device_OneByIdWithHistory.URL = (req: Request) => `/head-staff/device/history-request/${req.id}`
export default async function HeadStaff_Device_OneByIdWithHistory(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Device_OneByIdWithHistory.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
