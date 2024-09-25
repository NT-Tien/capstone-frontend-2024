"use client"

import FunctionButton from "@/components/FunctionButton"
import RootHeader from "@/components/layout/RootHeader"
import UserActions from "@/components/UserActions"
import UserCard from "@/components/UserCard"
import useCurrentUser from "@/lib/domain/User/useCurrentUser"
import { HistoryOutlined, HomeOutlined, LaptopOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons"
import { Typography } from "antd"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
   const user = useCurrentUser()
   const router = useRouter()

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
               <FunctionButton
                  icon={<HomeOutlined />}
                  title="Trang chủ"
                  onClick={() => router.push("/head/dashboard")}
               />
               <FunctionButton icon={<SearchOutlined />} title="Quét mã QR" onClick={() => router.push("/head/scan")} />
               <FunctionButton
                  icon={<HistoryOutlined />}
                  title="Lịch sử"
                  onClick={() => router.push("/head/history")}
               />
            </main>
         </section>
         <section>
            <header className="mb-3 flex items-center gap-2">
               <UserOutlined />
               <Typography.Title level={5} className="mb-0">
                  Thao tác hồ sơ
               </Typography.Title>
            </header>
            <main className="grid grid-cols-1 gap-2">
               <UserActions />
            </main>
         </section>
      </div>
   )
}
