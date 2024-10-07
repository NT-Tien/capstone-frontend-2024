import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   status: IssueStatusEnum
} & AuthTokenWrapper
export type Response = IssueDto

Staff_Task_UpdateIssueStatus.URL = (req: Request) => `/staff/task/issue/${req.id}/${req.status}`
export default async function Staff_Task_UpdateIssueStatus(req: Request): Promise<Response> {
   return api
      .put<Response>(Staff_Task_UpdateIssueStatus.URL(req), undefined, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
