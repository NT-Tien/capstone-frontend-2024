import Cookies from "js-cookie"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { MachineModelDto } from "@/common/dto/MachineModel.dto"

export type Response = MachineModelDto[]

Admin_MachineModel_AllWithDeleted.URL = "/admin/machine-model/include-deleted"
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
