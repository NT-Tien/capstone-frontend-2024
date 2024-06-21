import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeleteResponse } from "@/common/types/DeleteResponse"

export type Request = { id: string }
export type Response = DeleteResponse

Admin_SpareParts_DeleteSoft.URL = (req: Request) => `/admin/spare-part/soft-delete/${req.id}`
export default async function Admin_SpareParts_DeleteSoft(req: Request): Promise<Response> {
   return api
      .delete<Response>(Admin_SpareParts_DeleteSoft.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
