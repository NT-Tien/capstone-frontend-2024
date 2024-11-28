import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"

export type Request = {
   id: string
} & AuthTokenWrapper
export type Response = NotificationDto

Notifications_Seen.URL = (req: Request) => `/notifications/${req.id}/seen`
export default async function Notifications_Seen(req: Request): Promise<Response> {
   return api
      .put<Response>(Notifications_Seen.URL(req), undefined, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
