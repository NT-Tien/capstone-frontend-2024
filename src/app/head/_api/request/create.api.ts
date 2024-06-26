import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"

export type Request = {
   device: string
   requester_note: string
}
export type Response = {}

Head_Request_Create.URL = "/head/request"
export default async function Head_Request_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(Head_Request_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
