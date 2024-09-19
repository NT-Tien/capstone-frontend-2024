import { SparePartDto } from "@/common/dto/SparePart.dto"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

export type Request = {
   page?: number
   limit?: number
   minQuantity?: number
   maxQuantity?: number
   machineModelId?: string
   name?: string
   quantity?: number
   order?: "ASC" | "DESC"
   orderBy?: "name" | "quantity" | "price"
   id?: string
}
export type Response = {
   list: SparePartDto[]
   total: number
}

Stockkeeper_SparePart_All.URL = (req: Request) => {
   const query = new URLSearchParams()
   if (req.id) query.append("id", req.id)
   if (req.minQuantity) query.append("minQuantity", req.minQuantity.toString())
   if (req.maxQuantity) query.append("maxQuantity", req.maxQuantity.toString())
   if (req.machineModelId) query.append("machineModelId", req.machineModelId)
   if (req.name) query.append("name", req.name)
   if (req.quantity) query.append("quantity", req.quantity.toString())
   if (req.order) query.append("order", req.order)
   if (req.orderBy) query.append("orderBy", req.orderBy)
   return (
      `/stockkeeper/spare-part/${req.page ?? 1}/${req.limit ?? 10}` + (query.toString() ? `?${query.toString()}` : "")
   )
}
export default async function Stockkeeper_SparePart_All(req: Request): Promise<Response> {
   return api
      .get<Response>(Stockkeeper_SparePart_All.URL(req), {
         transformResponse: (data) =>
            parseApiResponse<any>(data, (res) => ({
               list: res.data[0],
               total: res.data[1],
            })),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
