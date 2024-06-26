import { MachineModelDto } from "@/common/dto/MachineModel.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"

type Response = MachineModelDto[]

Admin_MachineModel_All.URL = "/admin/machine-model"
export default async function Admin_MachineModel_All(): Promise<Response> {
   return api
      .get<Response>(Admin_MachineModel_All.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
