import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"

export type Request = Pick<TypeErrorDto, "name" | "duration" | "description"> & {
   machineModel: string
}
export type Response = TypeErrorDto

Admin_TypeError_Create.URL = "/admin/type-error"
export default async function Admin_TypeError_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(Admin_TypeError_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
