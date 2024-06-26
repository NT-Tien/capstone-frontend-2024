import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { NotFoundError } from "@/common/error/not-found.error"
import { UnknownError } from "@/common/error/unknown.error"

export type Request = {
   username: string
   password: string
}
export type Response = string // jwt token

LoginCredentials.URL = "/auth/login"
export default async function LoginCredentials(req: Request): Promise<Response> {
   return api
      .post<Response>(LoginCredentials.URL, req, {
         transformResponse: [
            (data) =>
               parseApiResponse(data, undefined, (err) => {
                  if (err.statusCode === 404 && err.message === "Account not found") {
                     throw new NotFoundError("Account")
                  }

                  throw new UnknownError(err)
               }),
         ],
      })
      .then((res) => res.data)
}
