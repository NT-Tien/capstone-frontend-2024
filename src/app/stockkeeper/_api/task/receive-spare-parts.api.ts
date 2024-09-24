import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { TaskDto } from "@/common/dto/Task.dto"

export type Request = {
   id: string
   payload: {
      signature: string
   }
}
export type Response = TaskDto

Stockkeeper_Task_ReceiveSpareParts.URL = (req: Request) => `/stockkeeper/task/receipt/${req.id}`
export default async function Stockkeeper_Task_ReceiveSpareParts(req: Request): Promise<Response> {
   return api
      .post<Response>(Stockkeeper_Task_ReceiveSpareParts.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
