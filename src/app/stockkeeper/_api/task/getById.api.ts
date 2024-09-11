import api from "@/config/axios.config"
import Cookies from "js-cookie"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import { NotFoundError } from "@/common/error/not-found.error"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import { TaskDto } from "@/common/dto/Task.dto"

export type Request = {
   id: string
}
export type Response = TaskDto

Stockkeeper_Task_GetById.URL = (req: Request) => `/stockkeeper/task/${req.id}`
export default async function Stockkeeper_Task_GetById(req: Request): Promise<Response> {
   const response = await api
      .get<Response>(Stockkeeper_Task_GetById.URL(req), {
         transformResponse: (data) => {
            console.log("HERE now")
            console.log(data)
            return parseApiResponse(data, (res) => {
               console.log("res data")
               console.log(res)
               if (res.data === null) {
                  throw new NotFoundError("Device not found")
               }

               return res.data
            })
         },
         headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)

   console.log("response")
   console.log(response)

   return response
}
