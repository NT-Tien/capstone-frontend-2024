import { AreaDto } from "@/common/dto/Area.dto"
import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"
import { DeviceDto } from "@/common/dto/Device.dto"
import { SparePartDto } from "@/common/dto/SparePart.dto"

export type Request = {
   id: string
   payload: Pick<SparePartDto, "name" | "quantity" | "expirationDate"> & {
      machineModel: string
   }
}
export type Response = SparePartDto[]

Admin_SpareParts_Update.URL = (req: Request) => `/admin/spare-part/${req.id}`
export default async function Admin_SpareParts_Update(req: Request): Promise<Response> {
   return api
      .put<Response>(Admin_SpareParts_Update.URL(req), req.payload, {
         transformResponse: (data) => parseApiResponse(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
