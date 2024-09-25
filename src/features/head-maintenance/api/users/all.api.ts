import { UserDto } from "@/lib/domain/User/User.dto"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

export type Response = UserDto[]

HeadStaff_Users_AllStaff.URL = "/head-staff/account"
export default async function HeadStaff_Users_AllStaff(): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Users_AllStaff.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
