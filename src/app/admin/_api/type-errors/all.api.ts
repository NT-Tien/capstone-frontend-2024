import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { SparePartDto } from "@/common/dto/SparePart.dto"

export type Response = SparePartDto[]

Admin_TypeErrors_All.URL = "/admin/type-error"
export default async function Admin_TypeErrors_All(): Promise<Response> {
   return api
      .get<Response>(Admin_TypeErrors_All.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
