import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import api from "@/config/axios.config"
import Cookies from "js-cookie"

export type Response = {
   [id: string]: {
      sparePart: SparePartDto
      quantityNeedToAdd: number
      tasks: TaskDto[]
   }
}

Stockkeeper_SparePart_AllAddMore.URL = () => `/stockkeeper/spare-part/need-add-more`
export default async function Stockkeeper_SparePart_AllAddMore(): Promise<Response> {
   return api
      .get<Response>(Stockkeeper_SparePart_AllAddMore.URL(), {
         transformResponse: (data) =>
            parseApiResponse<any>(data),
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
