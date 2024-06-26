import { AreaDto } from "@/common/dto/Area.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeviceDto } from "@/common/dto/Device.dto"

export type Request = {
   id: string
   payload: Pick<DeviceDto, "operationStatus" | "description" | "positionX" | "positionY"> & {
      machineModel: string
      area: string
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
