import Cookies from "js-cookie"
import { decodeJwt } from "@/common/util/decodeJwt.util"
import useLogout from "@/common/hooks/useLogout"
import { JwtToken } from "@/common/types/JwtToken"

export default function useCurrentUser(): JwtToken {
   const token = Cookies.get("token")
   const [logout] = useLogout()
   if (!token) {
      logout().then()
      return {} as JwtToken // placeholder
   } else {
      return decodeJwt(token)
   }
}
