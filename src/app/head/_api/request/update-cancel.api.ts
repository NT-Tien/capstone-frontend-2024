import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/common/dto/Task.dto"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"

export type Request = {
   id: string
}
export type Response = {
   request: FixRequestDto
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
