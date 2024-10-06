import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

export type Request = { id: string; time: number }
export type Response = {
   total_requests: number
   total_tasks: number
   total_devices: number
   request: {
      pending_requests: number
      checked_requests: number
      approved_requests: number
      in_progress_requests: number
      closed_requests: number
      head_confirm_requests: number
      rejected_requests: number
   }
   task: {
      awaiting_spare_spart: number
      awaiting_fixer: number
      assigned: number
      in_progress: number
      completed: number
      head_staff_confirm: number
      cancelled: number
      staff_request_cancelled: number
      head_staff_confirm_staff_request_cancelled: number
      close_task_request_cancelled: number
   }
}

Admin_Devices_OneByAreaId.URL = (req: Request) => `/admin/device/get-all-by-area-id/${req.id}?time=${req.time}`

export default async function Admin_Devices_OneByAreaId(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Devices_OneByAreaId.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

export async function getTotalRequestsAndStatus(req: Request) {
   const admin = await Admin_Devices_OneByAreaId(req)

   return {
      total_requests: admin.total_requests || 0,
      request: admin.request || {},
      total_tasks: admin.total_tasks || 0,
      total_devices: admin.total_devices || 0,
   }
}
