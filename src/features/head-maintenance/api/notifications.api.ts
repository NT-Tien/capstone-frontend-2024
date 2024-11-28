import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"

export type Request = {
   hasSeen?: boolean
} & AuthTokenWrapper
export type Response = NotificationDto[]

HeadStaff_Notifications.URL = (req: Request) => {
   const searchParams = new URLSearchParams()
   if (req.hasSeen !== null && req.hasSeen !== undefined) searchParams.append("hasSeen", req.hasSeen.toString())

   return `head-staff/notifications` + (searchParams.toString() ? `?${searchParams.toString()}` : ``)
}
export default async function HeadStaff_Notifications(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Notifications.URL(req), {
         transformResponse: (data) => parseApiResponse<any>(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}