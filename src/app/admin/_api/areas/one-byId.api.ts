import { AreaDto } from "@/common/dto/Area.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = { id: string }
export type Response = AreaDto

Admin_Areas_OneById.URL = (req: Request) => `/admin/area/${req.id}`
export default async function Admin_Areas_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_Areas_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
