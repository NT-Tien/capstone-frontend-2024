import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { NotFoundError } from "@/lib/error/not-found.error"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

export type Request = {
   id: string
}
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
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
