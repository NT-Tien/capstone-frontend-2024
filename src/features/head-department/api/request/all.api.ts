import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

export type Response = RequestDto[]

Head_Request_All.URL = "/head/request"
export default async function Head_Request_All(): Promise<Response> {
   return api
      .get<Response>(Head_Request_All.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
