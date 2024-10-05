import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"

type Request = {
   page: number
   limit: number
   filters?: {
      id?: string
      areaId?: string
      machineModelId?: string
      positionX?: number
      positionY?: number
   }

   sort?: {
      order?: "ASC" | "DESC"
      orderBy?: "createdAt" | "updatedAt" | "position"
   }
}
type Response = {
   list: DeviceDto[]
   total: number
}

async function Admin_Device_AllWithFilterAndSort(request: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Device_AllWithFilterAndSort.URL(request), {
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

Admin_Device_AllWithFilterAndSort.URL = (req: Request) => {
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

   return `/admin/device/all/${req.page}/${req.limit}` + (searchParams.toString() ? `?${searchParams.toString()}` : "")
}

export default Admin_Device_AllWithFilterAndSort
export type { Request, Response }
