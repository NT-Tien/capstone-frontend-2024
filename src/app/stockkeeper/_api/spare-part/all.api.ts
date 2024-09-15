import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { MachineModelDto } from "@/common/dto/MachineModel.dto"
import { SparePartDto } from "@/common/dto/SparePart.dto"

export type Request = {
   page: number
   limit: number
}
export type Response = {
   list: SparePartDto[]
   total: number
}

Stockkeeper_SparePart_All.URL = (req: Request) => `/stockkeeper/spare-part/${req.page}/${req.limit}`
export default async function Stockkeeper_SparePart_All(req: Request): Promise<Response> {
   return api
      .get<Response>(Stockkeeper_SparePart_All.URL(req), {
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
