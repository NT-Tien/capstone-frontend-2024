import { FixRequestStatus } from "@/common/enum/issue-request-status.enum"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"

export type Request = {
   page: number
   limit: number
   status: FixRequestStatus
}
export type Response = {
   list: FixRequestDto[]
   total: number
}

HeadStaff_Request_All30Days.URL = (req: Request) => `/head-staff/request/${req.page}/${req.limit}/${req.status}`
export default async function HeadStaff_Request_All30Days(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Request_All30Days.URL(req), {
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
