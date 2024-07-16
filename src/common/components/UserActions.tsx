"use client"

import { Button } from "antd"
import useLogout from "@/common/hooks/useLogout"

export default function UserActions() {
   const [handleLogout] = useLogout()
   return (
      <>
         <Button size="middle">Update Phone Number</Button>
         <Button size="middle">Change Password</Button>
         <Button onClick={handleLogout} danger size="middle" type="primary">
            Log out
         </Button>
      </>
   )
}
