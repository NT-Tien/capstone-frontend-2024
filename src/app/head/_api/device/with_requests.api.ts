import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { NotFoundError } from "@/common/error/not-found.error"
import { DeviceDto } from "@/common/dto/Device.dto"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"

export type Request = {
   id: string
}
export type Response = DeviceDto & {
   requests: FixRequestDto[]
}

Head_Device_WithRequests.URL = (req: Request) => `/head/device/history-request/${req.id}`
export default async function Head_Device_WithRequests(req: Request): Promise<Response> {
   return api
      .get<Response>(Head_Device_WithRequests.URL(req), {
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
