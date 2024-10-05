import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {} & AuthTokenWrapper
export type Response = TypeErrorDto[]

HeadStaff_TypeError_Common.URL = () => `/head-staff/type-error/get-all-common/{id}`
export default async function HeadStaff_TypeError_Common(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_TypeError_Common.URL(), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
