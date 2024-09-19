import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus } from "@/common/enum/task-status.enum"

export type Request = {
   page: number
   limit: number
   search?: {
      name?: string
      priority?: boolean
      status?: TaskStatus
      machineModelId?: string
      deviceId?: string
      requestId?: string
      fixerName?: string
      confirmReceipt?: boolean
      fixerDate?: string
   }
   order?: {
      order?: "ASC" | "DESC"
      orderBy?: "createdAt" | "updatedAt" | "totalTime" | "name"
   }
}
export type Response = {
   list: TaskDto[]
   total: number
}

Stockkeeper_Task_AllSearch.URL = (req: Request) => {
   const query = new URLSearchParams()
   if (req.search) {
      const searchParams = Object.entries(req.search)
      for (const [key, value] of searchParams) {
         if (key == "status" && value == "HEAD_STAFF_CONFIRM") { // TODO quick fix
            query.append("status", "HEAD_DEPARTMENT_CONFIRM")
            continue
         }
         if (value) {
            query.append(key, value.toString())
         }
      }
   }

   if (req.order) {
      const orderParams = Object.entries(req.order)
      for (const [key, value] of orderParams) {
         if (value) {
            query.append(key, value)
         }
      }
   }

   return `/stockkeeper/task/search/${req.page}/${req.limit}` + (query.toString() ? `?${query.toString()}` : "")
}
export default async function Stockkeeper_Task_AllSearch(req: Request): Promise<Response> {
   return api
      .get<Response>(Stockkeeper_Task_AllSearch.URL(req), {
         transformResponse: (data) =>
            parseApiResponse<any>(data, (res) => ({
               list: res.data[0],
               total: res.data[1],
            })),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
