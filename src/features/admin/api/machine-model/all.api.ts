import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

type Request = {}
type Response = MachineModelDto[]

Admin_MachineModel_All.URL = "/admin/machine-model"
export default async function Admin_MachineModel_All(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_MachineModel_All.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

export type { Response, Request }
