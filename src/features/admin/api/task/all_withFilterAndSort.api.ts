import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

type Request = {
   page: number
   limit: number
   search: {
      id?: string
      name?: string
      priority?: boolean
      status?: TaskStatus
      machineModelId?: string
      deviceId?: string
      requestId?: string
      fixerName?: string
      confirmReceipt?: boolean
      fixerDate?: string
      totalTime?: number
      is_warranty?: string
   }
   order: {
      order?: "ASC" | "DESC"
      orderBy?: "createdAt" | "updatedAt" | "totalTime" | "name"
   }
}
type Response = {
   list: TaskDto[]
   total: number
}

async function Admin_Tasks_AllFilterAndSort(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Tasks_AllFilterAndSort.URL(req), {
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

Admin_Tasks_AllFilterAndSort.URL = (req: Request) => {
   console.log("9999", req)
   const searchParams = new URLSearchParams()
   if (req.search) {
      const search = Object.entries(req.search)
      for (const [key, value] of search) {
         if (value !== null && value !== undefined) {
            searchParams.append(key, value.toString())
         }
      }
   }

   if (req.order) {
      const order = Object.entries(req.order)
      for (const [key, value] of order) {
         if (value !== null && value !== undefined) {
            searchParams.append(key, value)
         }
      }
   }

   return `/admin/task/all/${req.page}/${req.limit}` + (searchParams.toString() ? `?${searchParams.toString()}` : "")
}

export default Admin_Tasks_AllFilterAndSort
export type { Request, Response }
