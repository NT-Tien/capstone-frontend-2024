import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { NotFoundError } from "@/lib/error/not-found.error"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
} & AuthTokenWrapper
export type Response = DeviceDto

Head_Device_OneId.URL = (req: Request) => `/head/device/${req.id}`
export default async function Head_Device_OneId(req: Request): Promise<Response> {
   return api
      .get<Response>(Head_Device_OneId.URL(req), {
         transformResponse: (data) =>
            parseApiResponse(data, (res) => {
               if (res.data === null) {
                  throw new NotFoundError("Device not found")
               }

               return res.data
            }),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
