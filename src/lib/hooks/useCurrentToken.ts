"use client"

import Cookies from "js-cookie"

function useCurrentToken() {
   return Cookies.get("token")
}

export default useCurrentToken
