import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"

type Request = {
   type: "fix-sp" | "warranty" | "renew" | "all" | "fix-rpl-sp"
   startDate: string
   endDate: string
   areaId?: string
}
type Response = {
   [key in
      | TaskStatus
      | "spare-part-fetched"
      | "spare-part-unfetched"
      | "uninstall-device-old-already-and-move-to-stock"
      | "uninstall-device-already-and-move-to-warranty"
      | "uninstall-device-waiter-already-and-move-to-stock"
      | "install-device-warranted-already"
      | "install-device-waiter-already"
      | "install-device-already-from-stock"]: number
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
   if (req.areaId) {
      urlparam.append("areaId", req.areaId)
   }
   urlparam.append("startDate", req.startDate)
   urlparam.append("endDate", req.endDate)
   return `/admin/task/dashboard-info?${urlparam.toString()}`
}

export default Admin_Task_Dashboard
export type { Request, Response }
