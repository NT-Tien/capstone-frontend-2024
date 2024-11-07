import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   autoClose?: boolean
   payload: {
      fixerNote: string
      imagesVerify: string[]
      videosVerify: string
   }
} & AuthTokenWrapper
export type Response = TaskDto

Staff_Task_UpdateFinish.URL = (req: Request) => {
   const urlSearchParams = new URLSearchParams()
   if (req.autoClose) urlSearchParams.append("autoClose", req.autoClose.toString())
      
   return `/staff/task/complete/${req.id}` + (urlSearchParams.toString() ? `?${urlSearchParams.toString()}` : "")
}
export default async function Staff_Task_UpdateFinish(req: Request): Promise<Response> {
   return api
      .post<Response>(Staff_Task_UpdateFinish.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
