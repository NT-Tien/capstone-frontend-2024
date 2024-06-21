import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeleteResponse } from "@/common/types/DeleteResponse"

export type Request = { id: string }
export type Response = DeleteResponse

HeadStaff_Task_Delete.URL = (req: Request) => `/head-staff/task/${req.id}`
export default async function HeadStaff_Task_Delete(req: Request): Promise<Response> {
   return api
      .delete<Response>(HeadStaff_Task_Delete.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
