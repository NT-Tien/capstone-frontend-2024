import { UserDto } from "@/common/dto/User.dto"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

export type Response = UserDto[]

HeadStaff_Users_All.URL = "/head-staff/account"
export default async function HeadStaff_Users_All(): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Users_All.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
