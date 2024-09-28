import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"

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
