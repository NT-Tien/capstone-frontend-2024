import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {} & AuthTokenWrapper
export type Response = DeviceDto[]

HeadStaff_Device_AllNoPosition.URL = (req: Request) => "/head-staff/device/all/no-position"
export default async function HeadStaff_Device_AllNoPosition(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Device_AllNoPosition.URL(req), {
         transformResponse: (data) => parseApiResponse(data, (res) => res.data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
