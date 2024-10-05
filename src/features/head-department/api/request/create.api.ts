import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   device: string
   requester_note: string
} & AuthTokenWrapper
export type Response = RequestDto

Head_Request_Create.URL = "/head/request"
export default async function Head_Request_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(Head_Request_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
