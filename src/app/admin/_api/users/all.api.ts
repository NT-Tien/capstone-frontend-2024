import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { UserDto } from "@/lib/domain/User/User.dto"

export type Response = UserDto[]

Users_All.URL = "/auth/admin/all-accounts"
export default async function Users_All(): Promise<Response> {
   return api
      .get<Response>(Users_All.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
