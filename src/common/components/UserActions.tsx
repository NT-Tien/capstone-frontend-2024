"use client"

import { Button } from "antd"
import useLogout from "@/common/hooks/useLogout"
import { useTranslation } from "react-i18next"

export default function UserActions() {
   const [handleLogout] = useLogout()
   const { t } = useTranslation()
   return (
      <>
         <Button size="large">{t('PhoneNumber')}</Button>
         <Button size="large">{t('ChangePassword')}</Button>
         <Button onClick={handleLogout} danger size="large" type="primary">
            {t('logout')}
         </Button>
      </>
   )
}
