import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

type Request = {
   page: number
   limit: number
   filters?: {
      id?: string
      requester_note?: string
      status?: FixRequestStatus
      is_warranty?: string
      is_seen?: string
      machineModelId?: string
      deviceId?: string
      areaId?: string
      requesterName?: string
      createdAt?: string
      updatedAt?: string
      createdAtRangeStart?: string
      createdAtRangeEnd?: string
      updatedAtRangeStart?: string
      updatedAtRangeEnd?: string
   }
   sort?: {
      order?: "ASC" | "DESC"
      orderBy?: "createdAt" | "updatedAt"
   }
} & AuthTokenWrapper
type Response = {
   list: RequestDto[]
   total: number
}

async function Admin_Requests_AllWithFilterAndSort(request: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Requests_AllWithFilterAndSort.URL(request), {
         transformResponse: (data) =>
            parseApiResponse<any>(data, (res) => ({
               list: res.data[0],
               total: res.data[1],
            })),
         headers: {
            Authorization: `Bearer ${request.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

Admin_Requests_AllWithFilterAndSort.URL = (req: Request) => {
   const searchParams = new URLSearchParams()
   if (req.filters) {
      const filters = Object.entries(req.filters)
      for (const [key, value] of filters) {
         if (value !== null && value !== undefined) {
            searchParams.append(key, value.toString())
         }
      }
   }

   if (req.sort) {
      const sort = Object.entries(req.sort)
      for (const [key, value] of sort) {
         if (value !== null && value !== undefined) {
            searchParams.append(key, value)
         }
      }
   }

   return `/admin/request/all/${req.page}/${req.limit}` + (searchParams.toString() ? `?${searchParams.toString()}` : "")
}

export default Admin_Requests_AllWithFilterAndSort
export type { Request, Response }
