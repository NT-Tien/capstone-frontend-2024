import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { MachineModelDto } from "@/common/dto/MachineModel.dto"
import { DeviceDto } from "@/common/dto/Device.dto"

export type Request = Pick<DeviceDto, "operationStatus" | "description" | "positionX" | "positionY"> & {
   machineModel: string
   area: string
}
export type Response = MachineModelDto

Admin_Devices_Create.URL = "/admin/device"
export default async function Admin_Devices_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(Admin_Devices_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
