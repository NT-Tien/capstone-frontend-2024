import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeleteResponse } from "@/common/types/DeleteResponse"

export type Request = { id: string }
export type Response = DeleteResponse

Admin_MachineModel_Restore.URL = (req: Request) => `/admin/machine-model/restore/${req.id}`
export default async function Admin_MachineModel_Restore(req: Request): Promise<Response> {
   return api
      .put<Response>(Admin_MachineModel_Restore.URL(req), undefined, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
