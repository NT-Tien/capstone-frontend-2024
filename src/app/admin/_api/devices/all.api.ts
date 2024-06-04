import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeviceDto } from "@/common/dto/Device.dto"

type Response = DeviceDto[]

Devices_All.URL = "/device"
export default async function Devices_All(): Promise<Response> {
   return api
      .get<Response>(Devices_All.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
