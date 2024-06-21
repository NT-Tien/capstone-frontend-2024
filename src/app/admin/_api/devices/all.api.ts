import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeviceDto } from "@/common/dto/Device.dto"

type Response = DeviceDto[]

Admin_Devices_All.URL = "/admin/device"
export default async function Admin_Devices_All(): Promise<Response> {
   return api
      .get<Response>(Admin_Devices_All.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
