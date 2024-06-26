import Cookies from "js-cookie"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { SparePartDto } from "@/common/dto/SparePart.dto"

export type Response = SparePartDto[]

Admin_SpareParts_AllWithDeleted.URL = "/admin/spare-part/include-deleted"
export default async function Admin_SpareParts_AllWithDeleted(): Promise<Response> {
   return api
      .get<Response>(Admin_SpareParts_AllWithDeleted.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
