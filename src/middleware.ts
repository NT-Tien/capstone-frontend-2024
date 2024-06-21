import { NextRequest, NextResponse } from "next/server"
import { decodeJwt } from "@/common/util/decodeJwt.util"
import { Role } from "@/common/enum/role.enum"

export function middleware(request: NextRequest) {
   // ignore static assets
   if (request.nextUrl.pathname.startsWith("/_next/static/")) {
      return NextResponse.next()
   }

   if (request.nextUrl.pathname === "/login") {
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

   return NextResponse.next()
}
