import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"

export type Request = {
   sparePartId: string
   issueId: string
   payload: {
      quantity: number
   }
}
export type Response = SparePartDto

Stockkeeper_SparePart_Update_Quantity.URL = (req: Request) => `/stockkeeper/spare-part/addQuantity/${req.sparePartId}/${req.issueId}`
export default async function Stockkeeper_SparePart_Update_Quantity(req: Request): Promise<Response> {
    return api
       .put<Response>(Stockkeeper_SparePart_Update_Quantity.URL(req), req.payload, {
          transformResponse: (data) => parseApiResponse(data),
          headers: {
             Authorization: `Bearer ${Cookies.get("token")}`,
          },
       })
       .then((res) => res.data)
       .catch((error) => {
          console.error("API update error:", error)
          throw error
       })
 }
 
