import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

export type Request = { id: string }
export type Response = RequestDto

Admin_Request_OneById.URL = (req: Request) => `/admin/request/one/${req.id}`
export default async function Admin_Request_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Request_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
