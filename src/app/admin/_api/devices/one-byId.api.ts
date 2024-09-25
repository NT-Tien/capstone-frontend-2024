import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"

export type Request = { id: string }
export type Response = DeviceDto

Admin_Devices_OneById.URL = (req: Request) => `/admin/device/${req.id}`
export default async function Admin_Devices_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Devices_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
