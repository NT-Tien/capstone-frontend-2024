import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeleteResponse } from "@/lib/types/DeleteResponse"

export type Request = { id: string }
export type Response = DeleteResponse

Admin_MachineModel_DeleteSoft.URL = (req: Request) => `/admin/machine-model/soft-delete/${req.id}`
export default async function Admin_MachineModel_DeleteSoft(req: Request): Promise<Response> {
   return api
      .delete<Response>(Admin_MachineModel_DeleteSoft.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
