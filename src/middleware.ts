import { Role } from "@/common/enum/role.enum"
import { decodeJwt } from "@/common/util/decodeJwt.util"
import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {

   // ignore static assets
   if (request.nextUrl.pathname.startsWith("/_next/static/") || request.nextUrl.pathname.startsWith("/images/")) {
      return NextResponse.next()
   }

   if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname.startsWith("/test")) {
      // check if user is already logged in
      return NextResponse.next()
   }

   const token = request.cookies.get("token")
   if (!token) {
      return NextResponse.redirect(new URL("/login?error=unauthenticated", request.url))
   }
   const payload = decodeJwt(token.value)
   const pathname = request.nextUrl.pathname.split("/")[1]

   if (
      (pathname === "admin" && payload.role !== Role.admin) ||
      (pathname === "staff" && payload.role !== Role.staff) ||
      (pathname === "head-staff" && payload.role !== Role.headstaff) ||
      (pathname === "head" && payload.role !== Role.head) ||
      (pathname === "manager" && payload.role !== Role.manager) ||
      (pathname === "stockkeeper" && payload.role !== Role.stockkeeper)
   ) {
      const response = NextResponse.redirect(new URL("/login?error=unauthenticated", request.url))
      response.cookies.delete("token")
      return response
   }

   if (pathname === "stockkeeper") {
      const device = request.headers.get("user-agent") // Adjust this to correctly detect the device type
      if (device && device.includes("Mobile")) {
         return NextResponse.next()
      } else if (!request.nextUrl.pathname.includes("/stockkeeper/desktop")) {
         return NextResponse.redirect(new URL("/stockkeeper/desktop/dashboard", request.url))
      }
   }

   return NextResponse.next()
}
