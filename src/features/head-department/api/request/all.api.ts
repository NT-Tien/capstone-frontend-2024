import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = AuthTokenWrapper

export type Response = RequestDto[]
Head_Request_All.URL = "/head/request"
export default async function Head_Request_All(req: Request): Promise<Response> {
   return api
      .get<Response>(Head_Request_All.URL, {
         transformResponse: (data) => parseApiResponse<any>(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
