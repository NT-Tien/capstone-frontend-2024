"use client"

import RootHeader from "@/common/components/RootHeader"
import {
   EllipsisOutlined,
   HistoryOutlined,
   HomeOutlined,
   LaptopOutlined,
   SearchOutlined,
   UserOutlined,
} from "@ant-design/icons"
import { Button, Divider, Skeleton, Typography } from "antd"
import useCurrentUser from "@/common/hooks/useCurrentUser"
import UserActions from "@/common/components/UserActions"
import UserCard from "@/common/components/UserCard"
import FunctionButton from "@/common/components/FunctionButton"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"

export default function ProfilePage() {
   const user = useCurrentUser()
   const router = useRouter()
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
               <FunctionButton icon={<HomeOutlined />} title="Home" onClick={() => router.push("/head/dashboard")} />
               <FunctionButton icon={<SearchOutlined />} title="Scan QR" onClick={() => router.push("/head/scan")} />
               <FunctionButton
                  icon={<HistoryOutlined />}
                  title="My Requests"
                  onClick={() => router.push("/head/history")}
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
