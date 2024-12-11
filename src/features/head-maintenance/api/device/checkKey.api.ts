import api from "@/config/axios.config"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

type Request = {
    areaId: string
    positionX: string
    positionY: string
} & AuthTokenWrapper
type Response = boolean

HeadStaff_Device_CheckKey.URL = (req: Request) => `/head-staff/device/checkKey/${req.areaId}/${req.positionX}/${req.positionY}`
export default async function HeadStaff_Device_CheckKey(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Device_CheckKey.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
export type { Request, Response }
