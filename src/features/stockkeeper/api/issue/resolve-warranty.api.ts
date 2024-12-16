import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   id: string
} & AuthTokenWrapper
export type Response = {}

Stockkeeper_Issue_CompleteReturnDevice.URL = (req: Request) => `/stockkeeper/issue/warranty/complete-return-device/${req.id}`
export default async function Stockkeeper_Issue_CompleteReturnDevice(req: Request): Promise<Response> {
   return api
      .put<Response>(Stockkeeper_Issue_CompleteReturnDevice.URL(req), undefined, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
