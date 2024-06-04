import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { SparePartDto } from "@/common/dto/SparePart.dto"

export type Response = SparePartDto[]

SpareParts_All.URL = "/spare-part"
export default async function SpareParts_All(): Promise<Response> {
   return api
      .get<Response>(SpareParts_All.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
