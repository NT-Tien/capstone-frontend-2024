import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"

export type Request = {
   id: string
   payload: Pick<
      MachineModelDto,
      "name" | "description" | "manufacturer" | "yearOfProduction" | "dateOfReceipt" | "warrantyTerm"
   >
}
export type Response = MachineModelDto[]

Admin_MachineModel_Update.URL = (req: Request) => `/admin/machine-model/${req.id}`
export default async function Admin_MachineModel_Update(req: Request): Promise<Response> {
   return api
      .put<Response>(Admin_MachineModel_Update.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
