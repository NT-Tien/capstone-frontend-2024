import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { UserDto } from "@/common/dto/User.dto"

export type Request = { id: string }
export type Response = UserDto

HeadStaff_User_OneById.URL = (req: Request) => `/head-staff/account/${req.id}`
export default async function HeadStaff_User_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_User_OneById.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
