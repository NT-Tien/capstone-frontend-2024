"use client"

import useLogout from "@/common/hooks/useLogout"
import { Button } from "antd"

export default function UserActions() {
   const [handleLogout] = useLogout()
   return (
      <>
         <Button size="middle">Thay đổi số điện thoại</Button>
         <Button size="middle">Thay đổi mật khẩu</Button>
         <Button onClick={handleLogout} danger size="middle" type="primary">
            Đăng xuất
         </Button>
      </>
   )
}
