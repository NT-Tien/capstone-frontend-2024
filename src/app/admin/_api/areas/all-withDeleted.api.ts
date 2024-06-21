import Cookies from "js-cookie"
import { AreaDto } from "@/common/dto/Area.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"

export type Response = AreaDto[]

Admin_Areas_AllWithDeleted.URL = "/admin/area/include-deleted"
export default async function Admin_Areas_AllWithDeleted(): Promise<Response> {
   return api
      .get<Response>(Admin_Areas_AllWithDeleted.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
