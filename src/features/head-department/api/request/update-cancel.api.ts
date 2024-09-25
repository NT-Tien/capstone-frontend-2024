import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

export type Request = {
   id: string
}
export type Response = {
   request: RequestDto
   feedback: any
}

Head_Request_UpdateCancel.URL = (req: Request) => `/head/request/${req.id}/cancel`
export default async function Head_Request_UpdateCancel(req: Request): Promise<Response> {
   return api
      .put<Response>(Head_Request_UpdateCancel.URL(req), undefined, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
