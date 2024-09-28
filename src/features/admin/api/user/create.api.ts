import { UserDto } from "@/lib/domain/User/User.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"

export type Request = Pick<UserDto, "username" | "phone"> & { password: string }
export type Response = UserDto

Users_Create.URL = "/auth/register"
export default async function Users_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(Users_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
      })
      .then((res) => res.data)
}
