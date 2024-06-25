import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskIssueDto } from "@/common/dto/TaskIssue.dto"

export type Request = {
   issue: string
   sparePart: string
   quantity: number
}
export type Response = SparePartDto

HeadStaff_SparePart_Create.URL = "/head-staff/issue-spare-part"
export default async function HeadStaff_SparePart_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(HeadStaff_SparePart_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
