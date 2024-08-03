import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/common/dto/Task.dto"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"

export type Request = {
   id: string
   payload: {
      content: string
   }
}
export type Response = {
   request: FixRequestDto
   feedback: any
}

Head_Request_UpdateClose.URL = (req: Request) => `/head/request/${req.id}/close`
export default async function Head_Request_UpdateClose(req: Request): Promise<Response> {
   return api
      .put<Response>(Head_Request_UpdateClose.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
