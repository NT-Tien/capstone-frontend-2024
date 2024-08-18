import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"

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
}
export type Response = null

HeadStaff_Issue_CreateMany.URL = "/head-staff/issue/many"
export default async function HeadStaff_Issue_CreateMany(req: Request): Promise<Response> {
   return api
      .post<Response>(HeadStaff_Issue_CreateMany.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
