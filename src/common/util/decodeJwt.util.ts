import { JwtToken } from "@/common/types/JwtToken"

export function decodeJwt(jwt: string): JwtToken {
   if (typeof window !== "undefined" && typeof window.document !== "undefined") {
      // is currently browser
      let base64Url = jwt.split(".")[1]
      let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      let jsonPayload = decodeURIComponent(
         window
            .atob(base64)
            .split("")
            .map(function (c) {
               return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
            })
            .join(""),
      )
      return JSON.parse(jsonPayload) as JwtToken
   } else {
      // is currently server
      return JSON.parse(Buffer.from(jwt.split(".")[1], "base64").toString()) as JwtToken
   }
}
