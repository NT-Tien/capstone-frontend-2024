"use client"

import RootHeader from "@/common/components/RootHeader"
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
         <RootHeader title={"Hồ sơ"} className="std-layout-outer p-4" />
         <UserCard jwt={user} />
         <section>
            <header className="mb-3 flex items-center gap-2">
               <LaptopOutlined />
               <Typography.Title level={5} className="mb-0">
                  Thông tin
               </Typography.Title>
            </header>
            <main className="grid grid-cols-3 gap-2">
               <FunctionButton icon={<HomeOutlined />} title="Trang chủ" onClick={() => router.push("/staff/dashboard")} />
               <FunctionButton icon={<ContainerFilled />} title="Tác vụ" onClick={() => router.push("/staff/tasks")} />
               <FunctionButton icon={<CheckOutlined />} title="Bản đồ" onClick={() => router.push("/staff/map")} />
               <FunctionButton
                  icon={<ContainerFilled />}
                  title="Tác vụ hoàn tất"
                  onClick={() => router.push("/staff/tasks/completed")}
               />
            </main>
         </section>
         <section>
            <header className="mb-3 flex items-center gap-2">
               <UserOutlined />
               <Typography.Title level={5} className="mb-0">
                  Hồ sơ
               </Typography.Title>
            </header>
            <main className="grid grid-cols-1 gap-2">
               <UserActions />
            </main>
         </section>
      </div>
   )
}
