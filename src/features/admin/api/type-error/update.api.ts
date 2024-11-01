import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"

export type Request = {
   id: string
   payload: Pick<TypeErrorDto, "name" | "duration" | "description"> & {
      machineModel: string
   }
}
export type Response = TypeErrorDto[]

Admin_TypeError_Update.URL = (req: Request) => `/admin/type-error/${req.id}`
export default async function Admin_TypeError_Update(req: Request): Promise<Response> {
   return api
      .put<Response>(Admin_TypeError_Update.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
