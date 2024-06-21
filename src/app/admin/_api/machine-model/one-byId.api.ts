import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { MachineModelDto } from "@/common/dto/MachineModel.dto"

export type Request = { id: string }
export type Response = MachineModelDto

Admin_MachineModel_OneById.URL = (req: Request) => `/admin/machine-model/${req.id}`
export default async function Admin_MachineModel_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_MachineModel_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
