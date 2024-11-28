import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"

export type Request = {} & AuthTokenWrapper
export type Response = NotificationDto

Notifications_SeenAll.URL = (req: Request) => `/notifications/seen-all`
export default async function Notifications_SeenAll(req: Request): Promise<Response> {
   return api
      .put<Response>(Notifications_SeenAll.URL(req), undefined, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
