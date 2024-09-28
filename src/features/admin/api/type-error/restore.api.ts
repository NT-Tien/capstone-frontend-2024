import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeleteResponse } from "@/lib/types/DeleteResponse"

export type Request = { id: string }
export type Response = DeleteResponse

Admin_SpareParts_Restore.URL = (req: Request) => `/admin/spare-part/restore/${req.id}`
export default async function Admin_SpareParts_Restore(req: Request): Promise<Response> {
   return api
      .put<Response>(Admin_SpareParts_Restore.URL(req), undefined, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
