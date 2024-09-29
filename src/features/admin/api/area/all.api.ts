import { AreaDto } from "@/lib/domain/Area/Area.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = {}
export type Response = AreaDto[]

Admin_Areas_All.URL = "/admin/area"
export default async function Admin_Areas_All(): Promise<Response> {
   return api
      .get<Response>(Admin_Areas_All.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
