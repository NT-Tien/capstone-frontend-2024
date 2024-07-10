import { UploadFile } from "antd"

const isImageFileType = (type: string): boolean => type.indexOf("image/") === 0
const extname = (url: string = "") => {
   const temp = url.split("/")
   const filename = temp[temp.length - 1]
   const filenameWithoutSuffix = filename.split(/#|\?/)[0]
   return (/\.[^./\\]*$/.exec(filenameWithoutSuffix) || [""])[0]
}

export default function checkImageUrl(file: UploadFile): boolean {
   if (file.type) {
      return isImageFileType(file.type)
   }
   const url: string = (file.thumbUrl || file.url) as string
   const extension = extname(url)
   if (/^data:image\//.test(url) || /(webp|svg|png|gif|jpg|jpeg|jfif|bmp|dpg|ico)$/i.test(extension)) {
      return true
   }
   if (/^data:/.test(url)) {
      // other file types of base64
      return false
   }
   return !extension
}
