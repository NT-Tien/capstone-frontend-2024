import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   issues: {
      typeError: string
      description: string
      fixType: string
      spareParts: {
         sparePart: string
         quantity: number
      }[]
   }[]
   request: string
} & AuthTokenWrapper
export type Response = null

HeadStaff_Issue_CreateMany.URL = "/head-staff/issue/many"
export default async function HeadStaff_Issue_CreateMany(req: Request): Promise<Response> {
   return api
      .post<Response>(HeadStaff_Issue_CreateMany.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
