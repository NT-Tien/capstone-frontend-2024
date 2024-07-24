"use client"

import { Button } from "antd"
import useLogout from "@/common/hooks/useLogout"
import { useTranslation } from "react-i18next"

export default function UserActions() {
   const [handleLogout] = useLogout()
   const { t } = useTranslation()
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
