"use client"

import { Tabs } from "antd"
import { useState } from "react"
import FixRequestTab from "@/app/simulation/(layout)/main-flow/fix-request.tab"
import { cn } from "@/lib/utils/cn.util"
import WarrantyRequestTab from "@/app/simulation/(layout)/main-flow/warranty-request.tab"

function Page() {
   const [tab, setTab] = useState<string>("fix-request")
   return (
      <div className="h-full p-3 px-32">
         <Tabs
            activeKey={tab}
            onChange={(key) => setTab(key)}
            items={[
               {
                  label: "Flow sửa chữa yêu cầu",
                  key: "fix-request",
               },
               {
                  label: "Flow bảo hành",
                  key: "warranty",
               },
               {
                  label: "Flow thay máy",
                  key: "replace",
               },
            ]}
         />
         <div className={cn("hidden", tab === "fix-request" && "block")}>
            <FixRequestTab />
         </div>
         <div className={cn("hidden", tab === "warranty" && "block")}>
            <WarrantyRequestTab />
         </div>
      </div>
   )
}

export default Page
