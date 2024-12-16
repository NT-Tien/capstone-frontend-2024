import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      code: string
      send_date: string
      receive_date: string
      wc_receiverName: string
      wc_receiverPhone: string
      send_note?: string
      wc_name: string
      wc_address_1: string
      wc_address_2: string
      wc_address_ward: string
      wc_address_district: string
      wc_address_city: string
      send_bill_image: string[]
   }
} & AuthTokenWrapper
export type Response = TaskDto

Staff_Task_UpdateFinishWarrantySend.URL = (req: Request) => {
   return `/staff/task/complete/${req.id}/warranty`
}
export default async function Staff_Task_UpdateFinishWarrantySend(req: Request): Promise<Response> {
   console.log("HERE", req)
   return api
      .post<Response>(Staff_Task_UpdateFinishWarrantySend.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
