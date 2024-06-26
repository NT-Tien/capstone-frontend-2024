import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { IssueRequestDto } from "@/common/dto/IssueRequest.dto"

export type Response = IssueRequestDto[]

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
