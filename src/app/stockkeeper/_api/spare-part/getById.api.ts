import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { NotFoundError } from "@/common/error/not-found.error"
import { SparePartDto } from "@/common/dto/SparePart.dto"

export type Request = {
   id: string
}
export type Response = SparePartDto

Stockkeeper_SparePart_GetById.URL = (req: Request) => `/stockkeeper/spare-part/${req.id}`
export default async function Stockkeeper_SparePart_GetById(req: Request): Promise<Response> {
   return api
      .get<Response>(Stockkeeper_SparePart_GetById.URL(req), {
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
