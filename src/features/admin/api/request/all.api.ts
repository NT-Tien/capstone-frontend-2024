import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

type Request = {
   page: number
   limit: number
   status: FixRequestStatus
   time: 1 | 2 | 3
}
type Response = RequestDto[]

async function Admin_Requests_All(request: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Requests_All.URL(request), {
         transformResponse: (data) => parseApiResponse<any>(data, (res) => res.data),
         // ({
         //    list: res.data[0],
         //    total: res.data[1],
         // })
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

Admin_Requests_All.URL = ({ page, limit, status, time = 1 }: Request) =>
   `/admin/request/${page}/${limit}/${status}?time=${time}&all=true`

export default Admin_Requests_All
export type { Request, Response }
