import { UserDto } from "@/lib/domain/User/User.dto"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = { fixDate: string } & AuthTokenWrapper
export type Response = UserDto[]

HeadStaff_Users_AllStaffAvailable.URL = (req: Request) => `/head-staff/account/get-all-avaiable/${req.fixDate}`
export default async function HeadStaff_Users_AllStaffAvailable(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Users_AllStaffAvailable.URL(req), {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
