import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { NotFoundError } from "@/lib/error/not-found.error"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"

export type Request = {
   id: string
}
export type Response = MachineModelDto

Stockkeeper_MachineModel_GetById.URL = (req: Request) => `/stockkeeper/machine-model/${req.id}`
export default async function Stockkeeper_MachineModel_GetById(req: Request): Promise<Response> {
   return api
      .get<Response>(Stockkeeper_MachineModel_GetById.URL(req), {
         transformResponse: (data) =>
            parseApiResponse(data, (res) => {
               if (res.data === null) {
                  throw new NotFoundError("Device not found")
               }

               return res.data
            }),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
