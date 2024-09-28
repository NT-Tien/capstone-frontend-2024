import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

type Response = MachineModelDto[]

Admin_MachineModel_All.URL = "/admin/warehouse"
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
