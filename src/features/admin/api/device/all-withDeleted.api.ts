import Cookies from "js-cookie"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"

export type Response = DeviceDto[]

Admin_Devices_AllWithDeleted.URL = "/admin/device/include-deleted"
export default async function Admin_Devices_AllWithDeleted(): Promise<Response> {
   return api
      .get<Response>(Admin_Devices_AllWithDeleted.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
