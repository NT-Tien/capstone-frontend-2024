import { AreaDto } from "@/common/dto/Area.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { SparePartDto } from "@/common/dto/SparePart.dto"

export type Request = { id: string }
export type Response = SparePartDto

Admin_SpareParts_OneById.URL = (req: Request) => `/admin/spare-part/${req.id}`
export default async function Admin_SpareParts_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_SpareParts_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
