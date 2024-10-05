import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"

export type Request = {
   file: File
} & AuthTokenWrapper

export type Response = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   path: string
   size: number
   type: string
}

File_Image_Upload.URL = "/file-image/upload"

export async function File_Image_Upload(req: Request) {
   const formData = new FormData()
   formData.append("file", req.file)

   return api.post<Response>(File_Image_Upload.URL, formData, {
      transformResponse: (data) => parseApiResponse(data),
      headers: {
         Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         "Content-Type": "multipart/form-data",
      },
   })
}
