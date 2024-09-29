import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { UserDto } from "@/lib/domain/User/User.dto"

export type Request = {}
export type Response = UserDto[]

Admin_Users_All.URL = "/auth/admin/all-accounts"
export default async function Admin_Users_All(): Promise<Response> {
   return api
      .get<Response>(Admin_Users_All.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
