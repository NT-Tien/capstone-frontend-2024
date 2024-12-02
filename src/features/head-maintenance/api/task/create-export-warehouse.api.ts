import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   taskId: string
} & AuthTokenWrapper
export type Response = TaskDto

HeadStaff_Task_CreateExportWarehouse.URL = (req: Request) =>
   `/head-staff/task/${req.taskId}/create-export-warehouse/spare-part`
export default async function HeadStaff_Task_CreateExportWarehouse(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_Task_CreateExportWarehouse.URL(req), undefined, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
