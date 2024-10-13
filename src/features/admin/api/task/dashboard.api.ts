import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"

type Request = {
   type: "fix" | "warranty" | "renew" | "all"
   startDate: string
   endDate: string
}
type Response = {
   [key in TaskStatus]: number
}

async function Admin_Task_Dashboard(request: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Task_Dashboard.URL(request), {
         transformResponse: (data) => parseApiResponse<any>(data, (res) => res.data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

Admin_Task_Dashboard.URL = (req: Request) => {
   const urlparam = new URLSearchParams()
   urlparam.append("type", req.type)
   urlparam.append("startDate", req.startDate)
   urlparam.append("endDate", req.endDate)

   return `/admin/task/dashboard-info?${urlparam.toString()}`
}

export default Admin_Task_Dashboard
export type { Request, Response }
