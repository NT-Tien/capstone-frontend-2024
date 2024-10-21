import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

type Request = {} & AuthTokenWrapper
type Response = {
   [key in FixRequestStatus]: number
}

HeadStaff_Request_Statistics.URL = (req: Request) => `/head-staff/request/statistics`

async function HeadStaff_Request_Statistics(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Request_Statistics.URL(req), {
         transformResponse: (data) => parseApiResponse<any>(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

export default HeadStaff_Request_Statistics
export type { Request, Response }
