import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"

export type Request = Pick<
   MachineModelDto,
   "name" | "description" | "manufacturer" | "yearOfProduction" | "dateOfReceipt" | "warrantyTerm"
>
export type Response = MachineModelDto

Admin_MachineModels_Create.URL = "/admin/machine-model"
export default async function Admin_MachineModels_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(Admin_MachineModels_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
