import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { PositionDto } from "@/common/dto/Position.dto"

export type Response = PositionDto[]

Positions_All.URL = "/position"
export default async function Positions_All(): Promise<Response> {
   return api
      .get<Response>(Positions_All.URL, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
