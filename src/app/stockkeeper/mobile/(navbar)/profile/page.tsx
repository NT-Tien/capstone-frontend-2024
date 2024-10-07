"use client"

import FunctionButton from "@/components/FunctionButton"
import RootHeader from "@/components/layout/RootHeader"
import UserActions from "@/components/UserActions"
import UserCard from "@/components/UserCard"
import useCurrentUser from "@/lib/domain/User/useCurrentUser"
import { CheckOutlined, ContainerFilled, HomeOutlined, LaptopOutlined, UserOutlined } from "@ant-design/icons"
import { Typography } from "antd"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

function Page() {
   const router = useRouter()
   const user = useCurrentUser()

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
                  onClick={() => router.push("/stockkeeper/mobile/dashboard")}
               />
               <FunctionButton
                  icon={<ContainerFilled />}
                  title="Kho hàng"
                  onClick={() => router.push("/stockkeeper/mobile/warehouse")}
               />
               <FunctionButton
                  icon={<CheckOutlined />}
                  title="Quét mã QR"
                  onClick={() => router.push("/stockkeeper/mobile/scan")}
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

export default dynamic(() => Promise.resolve(Page), {
   ssr: false,
})
