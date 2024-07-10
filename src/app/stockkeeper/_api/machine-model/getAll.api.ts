import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { MachineModelDto } from "@/common/dto/MachineModel.dto"

export type Request = {
   page: number
   limit: number
}
export type Response = MachineModelDto[]

Stockkeeper_MachineModel_All.URL = (req: Request) => `/stockkeeper/machine-model/${req.page}/${req.limit}`
export default async function Stockkeeper_MachineModel_All(req: Request): Promise<Response> {
   return api
      .get<Response>(Stockkeeper_MachineModel_All.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
