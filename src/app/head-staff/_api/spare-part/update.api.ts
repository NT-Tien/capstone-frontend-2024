import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"

export type Request = {
   id: string
   payload: {
      issue?: string
      sparePart?: string
      quantity?: number
   }
}
export type Response = FixRequestDto

HeadStaff_SparePart_Update.URL = (req: Request) => `/head-staff/issue-spare-part/${req.id}`
export default async function HeadStaff_SparePart_Update(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_SparePart_Update.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
