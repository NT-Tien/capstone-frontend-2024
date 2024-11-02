import { AreaDto } from "@/lib/domain/Area/Area.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"

export type Request = {
   id: string
   payload: Pick<DeviceDto, "operationStatus" | "description"> & {
      machineModel: string
      area?: string
      positionX?: number;
      positionY?: number;
   }
}
export type Response = AreaDto[]

Admin_Devices_Update.URL = (req: Request) => `/admin/device/${req.id}`
export default async function Admin_Devices_Update(req: Request): Promise<Response> {
   return api
      .put<Response>(Admin_Devices_Update.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
