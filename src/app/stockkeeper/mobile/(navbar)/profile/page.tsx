"use client"

import RootHeader from "@/common/components/RootHeader"
import { Button, Typography } from "antd"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import {
   CheckOutlined,
   ContainerFilled,
   EllipsisOutlined,
   HistoryOutlined,
   HomeOutlined,
   LaptopOutlined,
   SearchOutlined,
   UserOutlined,
} from "@ant-design/icons"
import UserCard from "@/common/components/UserCard"
import FunctionButton from "@/common/components/FunctionButton"
import UserActions from "@/common/components/UserActions"
import { useTranslation } from "react-i18next"
import useCurrentUser from "@/common/hooks/useCurrentUser"

export default function ProfilePage() {
   const router = useRouter()
   const user = useCurrentUser()
   const { t } = useTranslation()

   return (
      <div className="std-layout gap-y-6">
         <RootHeader title={t("Profile")} className="std-layout-outer p-4" icon={<EllipsisOutlined />} />
         <UserCard jwt={user} />
         <section>
            <header className="mb-3 flex items-center gap-2">
               <LaptopOutlined />
               <Typography.Title level={5} className="mb-0">
                  Pages
               </Typography.Title>
            </header>
            <main className="grid grid-cols-3 gap-2">
               <FunctionButton
                  icon={<HomeOutlined />}
                  title="Home"
                  onClick={() => router.push("/stockkeeper/mobile/dashboard")}
               />
               <FunctionButton
                  icon={<ContainerFilled />}
                  title="Warehouse"
                  onClick={() => router.push("/stockkeeper/mobile/warehouse")}
               />
               <FunctionButton
                  icon={<CheckOutlined />}
                  title="Tasks"
                  onClick={() => router.push("/stockkeeper/mobile/tasks")}
               />
            </main>
         </section>
         <section>
            <header className="mb-3 flex items-center gap-2">
               <UserOutlined />
               <Typography.Title level={5} className="mb-0">
                  Profile
               </Typography.Title>
            </header>
            <main className="grid grid-cols-1 gap-2">
               <UserActions />
            </main>
         </section>
      </div>
   )
}
