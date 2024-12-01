import api from "@/config/axios.config"
import { FeedbackRating } from "@/lib/domain/Feedback/FeedbackRating.enum"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = {
   id: string
   payload: {
      content: string
      rating: FeedbackRating
   }
} & AuthTokenWrapper
export type Response = {}

Head_Request_Feedback.URL = (req: Request) => `/head/request/${req.id}/feedback`
export default async function Head_Request_Feedback(req: Request): Promise<Response> {
   return api
      .put<Response>(Head_Request_Feedback.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
