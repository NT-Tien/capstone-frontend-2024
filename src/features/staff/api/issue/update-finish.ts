import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      imagesVerify: string[]
      videosVerify: string
   }
} & AuthTokenWrapper
export type Response = TaskDto

Staff_Issue_UpdateFinish.URL = (req: Request) => `/staff/issue/${req.id}/resolved`
export default async function Staff_Issue_UpdateFinish(req: Request): Promise<Response> {
   return api
      .put<Response>(Staff_Issue_UpdateFinish.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
