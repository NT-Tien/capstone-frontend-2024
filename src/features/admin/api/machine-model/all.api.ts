import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

type Request = {
   withDevices?: boolean
}
type Response = MachineModelDto[]

Admin_MachineModel_All.URL = (req: Request) => {
   const searchParams = new URLSearchParams()
   console.log(req)
   if (req.withDevices) {
      searchParams.append("withDevices", req.withDevices.toString())
   }
   return "/admin/machine-model" + (searchParams.toString() ? `?${searchParams.toString()}` : "")
}
export default async function Admin_MachineModel_All(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_MachineModel_All.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

export type { Response, Request }
