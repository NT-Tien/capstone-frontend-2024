import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"

export type Request = {
   id: string
   payload: {
      task: string
      typeError: string
      description: string
      fixType: string
   }
}
export type Response = FixRequestIssueDto

HeadStaff_Issue_Update.URL = (req: Request) => `/head-staff/issue/${req.id}`
export default async function HeadStaff_Issue_Update(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_Issue_Update.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
