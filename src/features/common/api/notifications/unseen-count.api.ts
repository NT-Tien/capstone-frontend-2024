import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"

export type Request = {
   hasSeen?: boolean
} & AuthTokenWrapper
export type Response = NotificationDto[]

Notifications_UnseenCount.URL = (req: Request) => "/notifications/unseen-count"
export default async function Notifications_UnseenCount(req: Request): Promise<Response> {
   return api
      .get<Response>(Notifications_UnseenCount.URL(req), {
         transformResponse: (data) => parseApiResponse<any>(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
