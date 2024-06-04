import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { PositionDto } from "@/common/dto/Position.dto"

export type Request = Pick<PositionDto, "positionX" | "positionY"> & {
   area: string
}
export type Response = PositionDto

Positions_Create.URL = "/position"
export default async function Positions_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(Positions_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
