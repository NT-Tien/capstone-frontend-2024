import api from "@/config/axios.config"
import { parseApiResponse } from "@/common/util/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = {
   file: File
}

export type Response = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   path: string
   size: number
   type: string
}

File_Upload.URL = "/file-image/upload"

export async function File_Upload(req: Request) {
   const formData = new FormData()
   formData.append("file", req.file)

   return api.post<Response>(File_Upload.URL, formData, {
      transformResponse: (data) => parseApiResponse(data),
      headers: {
         Authorization: `Bearer ${Cookies.get("token")}`,
      },
   })
}
