import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { MachineModelDto } from "@/common/dto/MachineModel.dto"

export type Request = Pick<
   MachineModelDto,
   "name" | "description" | "manufacturer" | "yearOfProduction" | "dateOfReceipt" | "warrantyTerm"
>
export type Response = MachineModelDto

Admin_MachineModels_Create.URL = "/admin/warehouse"
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
