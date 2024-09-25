import Cookies from "js-cookie"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"

export type Response = MachineModelDto[]

Admin_MachineModel_AllWithDeleted.URL = "/admin/warehouse/include-deleted"
export default async function Admin_MachineModel_AllWithDeleted(): Promise<Response> {
   return api
      .get<Response>(Admin_MachineModel_AllWithDeleted.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
