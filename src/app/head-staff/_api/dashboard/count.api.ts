import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

export type Response = {
   pendingRequests: number
   checkedRequests: number
   approvedRequests: number
   inProgressRequests: number
   awaitingFixerTasks: number
   assignedTasks: number
   pendingSparePartTasks: number
   inProgressTasks: number
   headStaffConfirmTasks: number
}

HeadStaff_Dashboard_Count.URL = () => `/head-staff/dashboard`
export default async function HeadStaff_Dashboard_Count(): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Dashboard_Count.URL(), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
