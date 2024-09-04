import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

export type Request = {
   page: number
   limit: number
   status: FixRequestStatus
   time: 1 | 2 | 3
}
type Response = {
    list: FixRequestDto[]
    total: number
}

Admin_Requests_All.URL = ({ page, limit, status, time = 1 }: Request) =>
   `/admin/request/${page}/${limit}/${status}?time=${time}`
export default async function Admin_Requests_All(request: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Requests_All.URL(request), {
         transformResponse: (data) =>
            parseApiResponse<any>(data, (res) => ({
               list: res.data[0],
               total: res.data[1],
            })),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
