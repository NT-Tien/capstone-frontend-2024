import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

type Request = AuthTokenWrapper
type Response = {
   pendingRequests: number
   checkedRequests: number
   approvedRequests: number
   inProgressRequests: number
   headConfirmRequests: number
   rejectedRequests: number
   closedRequests: number
   awaitingFixerTasks: number
   assignedTasks: number
   awaitingSparePartTasks: number
   inProgressTasks: number
   headStaffConfirmTasks: number
}

HeadStaff_Dashboard_Count.URL = (req: Request) => `/head-staff/dashboard`

async function HeadStaff_Dashboard_Count(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Dashboard_Count.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

export default HeadStaff_Dashboard_Count
export type { Request, Response }
