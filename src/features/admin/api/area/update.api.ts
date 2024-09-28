import { AreaDto } from "@/lib/domain/Area/Area.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = { id: string; payload: Pick<AreaDto, "height" | "width" | "name" | "instruction"> }
export type Response = AreaDto[]

Admin_Areas_Update.URL = (req: Request) => `/admin/area/${req.id}`
export default async function Admin_Areas_Update(req: Request): Promise<Response> {
   return api
      .put<Response>(Admin_Areas_Update.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
