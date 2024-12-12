import api from "@/config/axios.config"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = {
   id: string
   taskId: string
   payload: {
      stockkeeper_signature: string
      staff_signature: string
   }
} & AuthTokenWrapper
export type Response = TaskDto

Stockkeeper_Device_ReturnRemovedDevice.URL = (req: Request) => `/stockkeeper/device/${req.id}/dismantle/${req.taskId}`
export default async function Stockkeeper_Device_ReturnRemovedDevice(req: Request): Promise<Response> {
   return api
      .post<Response>(Stockkeeper_Device_ReturnRemovedDevice.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
