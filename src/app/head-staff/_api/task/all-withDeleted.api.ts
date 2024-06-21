import Cookies from "js-cookie"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { TaskDto } from "@/common/dto/Task.dto"

export type Response = TaskDto[]

HeadStaff_Task_AllWithDeleted.URL = "/head-staff/task/include-deleted"
export default async function HeadStaff_Task_AllWithDeleted(): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Task_AllWithDeleted.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
