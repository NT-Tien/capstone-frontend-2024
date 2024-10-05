import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      content: string
   }
} & AuthTokenWrapper
export type Response = {
   request: RequestDto
   feedback: any
}

Head_Request_UpdateClose.URL = (req: Request) => `/head/request/${req.id}/close`
export default async function Head_Request_UpdateClose(req: Request): Promise<Response> {
   return api
      .put<Response>(Head_Request_UpdateClose.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
