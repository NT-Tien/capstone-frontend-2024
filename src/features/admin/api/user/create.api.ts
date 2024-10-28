import { UserDto } from "@/lib/domain/User/User.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = Pick<UserDto, "username" | "phone"> & { password: string }
export type Response = UserDto

Admin_Users_Create.URL = "/admin/user"
export default async function Admin_Users_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(Admin_Users_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`
         }
      })
      .then((res) => res.data)
}
