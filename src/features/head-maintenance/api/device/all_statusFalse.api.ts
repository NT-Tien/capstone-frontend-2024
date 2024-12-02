import api from "@/config/axios.config"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = {} & AuthTokenWrapper
export type Response = DeviceDto[]

HeadStaff_Device_AllStatusFalse.URL = (req: Request) => "/head-staff/device/all/status-false"
export default async function HeadStaff_Device_AllStatusFalse(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Device_AllStatusFalse.URL(req), {
         transformResponse: (data) => parseApiResponse(data, (res) => res.data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
