import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   request: string
   typeError: string
   description: string
   fixType: string
} & AuthTokenWrapper
export type Response = IssueDto

HeadStaff_Issue_Create.URL = "/head-staff/issue"
export default async function HeadStaff_Issue_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(HeadStaff_Issue_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
