import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeviceDto } from "@/common/dto/Device.dto"

export type Request = { id: string }
export type Response = DeviceDto

HeadStaff_Device_OneByIdWithHistory.URL = (req: Request) => `/head-staff/device/history-request/${req.id}`
export default async function HeadStaff_Device_OneByIdWithHistory(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Device_OneByIdWithHistory.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
