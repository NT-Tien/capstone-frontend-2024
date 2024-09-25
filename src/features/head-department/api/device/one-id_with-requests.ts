import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { NotFoundError } from "@/lib/error/not-found.error"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

export type Request = {
   id: string
}
export type Response = DeviceDto & {
   requests: RequestDto[]
}

Head_Device_OneId_WithRequests.URL = (req: Request) => `/head/device/history-request/${req.id}`
export default async function Head_Device_OneId_WithRequests(req: Request): Promise<Response> {
   return api
      .get<Response>(Head_Device_OneId_WithRequests.URL(req), {
         transformResponse: (data) =>
            parseApiResponse(data, (res) => {
               if (res.data === null) {
                  throw new NotFoundError("Device not found")
               }

               return res.data
            }),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
