import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { SparePartDto } from "@/common/dto/SparePart.dto"

export type Request = Pick<SparePartDto, "name" | "quantity" | "expirationDate"> & {
   machineModel: string
}
export type Response = SparePartDto

Admin_SpareParts_Create.URL = "/admin/spare-part"
export default async function Admin_SpareParts_Create(req: Request): Promise<Response> {
   return api
      .post<Response>(Admin_SpareParts_Create.URL, req, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
