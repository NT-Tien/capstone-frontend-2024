import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
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

File_Video_Upload.URL = "/file-video/upload"

export async function File_Video_Upload(req: Request) {
   const formData = new FormData()
   formData.append("file", req.file)

   return api.post<Response>(File_Video_Upload.URL, formData, {
      transformResponse: (data) => parseApiResponse(data),
      headers: {
         Authorization: `Bearer ${Cookies.get("token")}`,
         "Content-Type": "multipart/form-data",
      },
   })
}
