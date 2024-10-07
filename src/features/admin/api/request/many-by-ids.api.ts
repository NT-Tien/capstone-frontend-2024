import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

type Request = {
   ids: string[]
} & AuthTokenWrapper
type Response = RequestDto[]

async function Admin_Requests_ManyByIds(request: Request): Promise<Response> {
   return api
      .post<Response>(Admin_Requests_ManyByIds.URL(request), request, {
         transformResponse: (data) => parseApiResponse<any>(data, (res) => res.data),
         headers: {
            Authorization: `Bearer ${request.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

Admin_Requests_ManyByIds.URL = (req: Request) => `/admin/request/many-by-ids`

export default Admin_Requests_ManyByIds
export type { Request, Response }
