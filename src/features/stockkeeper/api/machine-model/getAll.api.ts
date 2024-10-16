import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"

export type Request = {
   page: number
   limit: number
}
export type Response = {
   list: MachineModelDto[]
   total: number
}

Stockkeeper_MachineModel_All.URL = (req: Request) => `/stockkeeper/machine-model/${req.page}/${req.limit}`
export default async function Stockkeeper_MachineModel_All(req: Request): Promise<Response> {
   return api
      .get<Response>(Stockkeeper_MachineModel_All.URL(req), {
         transformResponse: (data) =>
            parseApiResponse<any>(data, (res) => ({
               list: res.data[0],
               total: res.data[1],
            })),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
