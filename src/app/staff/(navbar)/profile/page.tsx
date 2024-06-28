"use client"

import { Button } from "antd"
import useLogout from "@/common/hooks/useLogout"

export default function ProfilePage() {
   const [logout] = useLogout()
   return <Button onClick={() => logout()}>Log Out</Button>
}
