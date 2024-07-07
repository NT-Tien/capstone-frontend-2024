import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { TaskDto } from "@/common/dto/Task.dto"

export type Request = {
   page: number
   limit: number
}
export type Response = {
   list: TaskDto[]
   total: number
}

Stockkeeper_Task_All.URL = (req: Request) => `/stockkeeper/task/${req.page}/${req.limit}`
export default async function Stockkeeper_Task_All(req: Request): Promise<Response> {
   return api
      .get<Response>(Stockkeeper_Task_All.URL(req), {
         transformResponse: (data) =>
            parseApiResponse<any>(data, (res) => ({
               list: res.data[0],
               total: res.data[1],
            })),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
