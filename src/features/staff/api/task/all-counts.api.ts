import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   month: number
   year: number
} & AuthTokenWrapper
export type Response = {
   fixer_date: string
   count: number
}[]

async function Staff_Task_AllCounts(req: Request): Promise<Response> {
   return api
      .get<Response>(Staff_Task_AllCounts.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}

Staff_Task_AllCounts.URL = (req: Request) => {
   const urlSearchParams = new URLSearchParams()
   urlSearchParams.append("month", req.month.toString())
   urlSearchParams.append("year", req.year.toString())

   return "/staff/task/all-counts" + "?" + urlSearchParams.toString()
}

export default Staff_Task_AllCounts
