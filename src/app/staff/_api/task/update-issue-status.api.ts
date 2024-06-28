import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/common/dto/Task.dto"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"
import { TaskIssueDto } from "@/common/dto/TaskIssue.dto"

export type Request = {
   id: string
   status: IssueStatusEnum
}
export type Response = TaskIssueDto

Staff_Task_UpdateIssueStatus.URL = (req: Request) => `/staff/task/issue/${req.id}/${req.status}`
export default async function Staff_Task_UpdateIssueStatus(req: Request): Promise<Response> {
   return api
      .put<Response>(Staff_Task_UpdateIssueStatus.URL(req), undefined, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
