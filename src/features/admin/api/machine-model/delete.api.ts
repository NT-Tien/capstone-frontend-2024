import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeleteResponse } from "@/lib/types/DeleteResponse"

export type Request = { id: string }
export type Response = DeleteResponse

Admin_MachineModel_Delete.URL = (req: Request) => `/admin/machine-model/${req.id}`
export default async function Admin_MachineModel_Delete(req: Request): Promise<Response> {
   return api
      .delete<Response>(Admin_MachineModel_Delete.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
