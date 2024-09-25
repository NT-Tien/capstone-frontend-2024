import { AreaDto } from "@/lib/domain/Area/Area.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = Pick<AreaDto, "name" | "instruction" | "width" | "height">
export type Response = AreaDto

Areas_Create.URL = "/admin/area"
export default async function Areas_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(Areas_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
