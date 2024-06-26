"use client"

import MobileNavbar from "@/common/components/MobileNavbar"
import { BellFilled, HomeFilled, PhoneFilled, SettingFilled } from "@ant-design/icons"
import { useState } from "react"

export default function TestPage() {
   const [currentRoute, setCurrentRoute] = useState("home")

   return (
      <div className="h-[2000px]">
         fdsfdsf
         <MobileNavbar
            currentActive={currentRoute}
            items={[
               {
                  name: "Home",
                  icon: <HomeFilled />,
                  key: "home",
                  onClick: () => setCurrentRoute("home"),
               },
               {
                  name: "Devices",
                  icon: <PhoneFilled />,
                  key: "profile",
                  onClick: () => setCurrentRoute("profile"),
               },
               {
                  name: "Notifications",
                  icon: <BellFilled />,
                  key: "notifications",
                  onClick: () => setCurrentRoute("notifications"),
                  countBadge: 3,
               },
               {
                  name: "Settings",
                  icon: <SettingFilled />,
                  key: "settings",
                  onClick: () => setCurrentRoute("settings"),
               },
            ]}
         />
      </div>
   )
}
