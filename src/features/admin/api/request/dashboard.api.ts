import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

type Request = {
   type: "fix" | "warranty" | "renew" | "all"
   areaId?: string
   startDate: string
   endDate: string
}
type Response = {
   [key in FixRequestStatus | "not_seen" | "has_seen"]: number
}

async function Admin_Requests_Dashboard(request: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Requests_Dashboard.URL(request), {
         transformResponse: (data) => parseApiResponse<any>(data, (res) => res.data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

Admin_Requests_Dashboard.URL = (req: Request) => {
   const urlparam = new URLSearchParams()
   urlparam.append("type", req.type)
   if (req.areaId) {
      urlparam.append("areaId", req.areaId)
   }
   urlparam.append("startDate", req.startDate)
   urlparam.append("endDate", req.endDate)

   return `/admin/request/dashboard-info?${urlparam.toString()}`
}

export default Admin_Requests_Dashboard
export type { Request, Response }
