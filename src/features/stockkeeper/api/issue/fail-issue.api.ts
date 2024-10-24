import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
   payload: {
      reason: string
      staffSignature: string
      stockkeeperSignature: string
   }
} & AuthTokenWrapper
export type Response = {}

Stockkeeper_Issue_Fail.URL = (req: Request) => `/stockkeeper/issue/fail-issue/${req.id}`
export default async function Stockkeeper_Issue_Fail(req: Request): Promise<Response> {
   return api
      .post<Response>(Stockkeeper_Issue_Fail.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
