import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { UserDto } from "@/lib/domain/User/User.dto"

export type Request = { id: string }
export type Response = UserDto

Admin_User_OneById.URL = (req: Request) => `/admin/user/one/${req.id}`
export default async function Admin_User_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Admin_User_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
