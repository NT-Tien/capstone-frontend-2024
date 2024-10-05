import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeleteResponse } from "@/lib/types/DeleteResponse"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = { id: string } & AuthTokenWrapper
export type Response = DeleteResponse

HeadStaff_Issue_Delete.URL = (req: Request) => `/head-staff/issue/${req.id}`
export default async function HeadStaff_Issue_Delete(req: Request): Promise<Response> {
   return api
      .delete<Response>(HeadStaff_Issue_Delete.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
