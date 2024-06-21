import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { SparePartDto } from "@/common/dto/SparePart.dto"

export type Request = {
   page: number
   limit: number
   searchName?: string
}
export type Response = {
   list: SparePartDto[]
   total: number
}

Admin_SpareParts_All.URL = ({ searchName = "", ...rest }) =>
   `/admin/spare-part/${rest.page}/${rest.limit}/${searchName}`
export default async function Admin_SpareParts_All(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_SpareParts_All.URL(req), {
         transformResponse: (data) =>
            parseApiResponse<any>(data, (res) => ({
               list: res.data[0],
               total: res.data[1],
            })),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
