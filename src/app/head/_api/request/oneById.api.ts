import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { NotFoundError } from "@/common/error/not-found.error"
import { DeviceDto } from "@/common/dto/Device.dto"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"

export type Request = {
   id: string
}
export type Response = FixRequestDto

Head_Request_OneById.URL = (req: Request) => `/head/request`
export default async function Head_Request_OneById(req: Request): Promise<Response> {
   return api
      .get<Response>(Head_Request_OneById.URL(req), {
         transformResponse: (data) =>
            parseApiResponse<any>(data, (res) => {
                const item = res.data.find((item: any) => item.id === req.id)

                if (!item) {
                    throw new NotFoundError("Request not found")
                }

                return item
            }),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
