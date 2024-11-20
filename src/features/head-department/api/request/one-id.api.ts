import api from "@/config/axios.config"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = {
   id: string
} & AuthTokenWrapper
export type Response = RequestDto

Head_Request_OneById.URL = (req: Request) => `/head/request/${req.id}`
export default async function Head_Request_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Head_Request_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse<any>(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
