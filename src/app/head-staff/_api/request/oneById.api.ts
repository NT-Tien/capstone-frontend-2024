import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { NotFoundError } from "@/common/error/not-found.error"

export type Request = {
   id: string
}
export type Response = FixRequestDto

HeadStaff_Request_OneById.URL = (req: Request) => `/head-staff/request/${req.id}`
export default async function HeadStaff_Request_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Request_OneById.URL(req), {
         transformResponse: (data) =>
            parseApiResponse(data, (res) => {
               if (res.data === null) {
                  throw new NotFoundError("Device not found")
               }

               return res.data
            }),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
