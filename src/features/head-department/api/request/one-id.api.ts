import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { NotFoundError } from "@/lib/error/not-found.error"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
} & AuthTokenWrapper
export type Response = RequestDto

Head_Request_OneById.URL = (req: Request) => `/head/request`
export default async function Head_Request_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Head_Request_OneById.URL(req), {
         transformResponse: (data) =>
            parseApiResponse<any>(data, (res) => {
               const item = res.data.find((item: any) => item.id === req.id)

               if (!item) {
                  throw new NotFoundError("Request not found")
               }

               return item
            }),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
