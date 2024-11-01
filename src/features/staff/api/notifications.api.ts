import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"

export type Request = {
   seen?: boolean
} & AuthTokenWrapper
export type Response = NotificationDto[]

Staff_Notifications.URL = (req: Request) => {
   const searchParams = new URLSearchParams()
   if (req.seen !== null && req.seen !== undefined) searchParams.append("seen", req.seen.toString())

   return `notify/staff` + (searchParams.toString() ? `?${searchParams.toString()}` : ``)
}
export default async function Staff_Notifications(req: Request): Promise<Response> {
   return api
      .get<Response>(Staff_Notifications.URL(req), {
         transformResponse: (data) => parseApiResponse<any>(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
