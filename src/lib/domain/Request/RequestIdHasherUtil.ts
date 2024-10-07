export function requestIdHasherUtil(id: string) {
   const cleanUuidStr = id.replace(/-/g, "")

   const uuidNum = parseInt(cleanUuidStr, 16)

   const shortNum = uuidNum % 10 ** 10

   return `RE${shortNum.toString().padStart(10, "0")}`
}
