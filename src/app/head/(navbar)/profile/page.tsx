"use client"

import RootHeader from "@/common/components/RootHeader"
import { UserOutlined } from "@ant-design/icons"
import { Button } from "antd"
import useLogout from "@/common/hooks/useLogout"

export default function ProfilePage() {
   const [handleLogout] = useLogout()

   return (
      <div>
         <RootHeader title="Profile" className="p-4" icon={<UserOutlined />} />
         <Button onClick={handleLogout}>Log out</Button>
      </div>
   )
}
