"use client"

import { Button } from "antd"
import useLogout from "@/common/hooks/useLogout"

export default function UserActions() {
   const [handleLogout] = useLogout()
   return (
      <>
         <Button size="large">Update Phone Number</Button>
         <Button size="large">Change Password</Button>
         <Button onClick={handleLogout} danger size="large" type="primary">
            Log out
         </Button>
      </>
   )
}
