"use client"

import RootHeader from "@/common/components/RootHeader"
import { Button } from "antd"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
   const router = useRouter()
   return (
      <div>
         <RootHeader title="Profile" className="p-4" />
         <div className="mt-4 px-4">
            <Button
               className="w-full"
               onClick={() => {
                  Cookies.remove("token")
                  router.push("/login?logout=success")
               }}
            >
               Log out
            </Button>
         </div>
      </div>
   )
}
