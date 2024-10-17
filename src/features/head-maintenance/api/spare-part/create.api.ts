import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   issue: string
   sparePart: string
   quantity: number
} & AuthTokenWrapper
export type Response = SparePartDto

HeadStaff_IssueSparePart_Create.URL = "/head-staff/issue-spare-part"
export default async function HeadStaff_IssueSparePart_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(HeadStaff_IssueSparePart_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
