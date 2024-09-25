import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"

export type Request = { id: string }
export type Response = DeviceDto

HeadStaff_Device_OneById.URL = (req: Request) => `/head-staff/device/${req.id}`
export default async function HeadStaff_Device_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Device_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
