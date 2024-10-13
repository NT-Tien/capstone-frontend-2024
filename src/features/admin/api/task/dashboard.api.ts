import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"

type Request = {
   type: "fix-sp" | "warranty" | "renew" | "all" | "fix-rpl-sp"
   areaId?: string
   startDate: string
   endDate: string
}
type Response = {
   [key in TaskStatus]: number
}

async function Admin_Tasks_Dashboard(request: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Tasks_Dashboard.URL(request), {
         transformResponse: (data) => parseApiResponse<any>(data, (res) => res.data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

Admin_Tasks_Dashboard.URL = (req: Request) => {
   const urlparam = new URLSearchParams()
   urlparam.append("type", req.type)
   if (req.areaId) {
      urlparam.append("areaId", req.areaId)
   }
   urlparam.append("startDate", req.startDate)
   urlparam.append("endDate", req.endDate)

   return `/admin/task/dashboard-info?${urlparam.toString()}`
}

export default Admin_Tasks_Dashboard
export type { Request, Response }
