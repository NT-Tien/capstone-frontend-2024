import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"

export type Response = TypeErrorDto[]

HeadStaff_TypeError_Common.URL = () => `/head-staff/type-error/get-all-common/{id}`
export default async function HeadStaff_TypeError_Common(): Promise<Response> {
   return api
      .get<Response>(HeadStaff_TypeError_Common.URL(), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
