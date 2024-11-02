import api from "@/config/axios.config"
import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = { id: string }
export type Response = TypeErrorDto

Admin_TypeError_OneById.URL = (req: Request) => `/admin/type-error/${req.id}`
export default async function Admin_TypeError_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_TypeError_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
