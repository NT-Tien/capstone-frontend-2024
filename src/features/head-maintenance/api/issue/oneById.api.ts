import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

export type Request = {
   id: string
}
export type Response = IssueDto

HeadStaff_Issue_OneById.URL = (req: Request) => `/head-staff/issue/${req.id}`
export default async function HeadStaff_Issue_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Issue_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
