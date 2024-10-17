import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"

export type Request = {
   id: string
   payload: {
      task?: string | null
      typeError?: string
      description?: string
      fixType?: string
      status?: IssueStatusEnum
   }
} & AuthTokenWrapper
export type Response = IssueDto

HeadStaff_Issue_Update.URL = (req: Request) => `/head-staff/issue/${req.id}`
export default async function HeadStaff_Issue_Update(req: Request): Promise<Response> {
   return api
      .put<Response>(HeadStaff_Issue_Update.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
