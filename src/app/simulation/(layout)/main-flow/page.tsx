"use client"

import { Tabs } from "antd"
import { useState } from "react"
import CreateRequestTab from "@/app/simulation/(layout)/main-flow/create-request.tab"

function Page() {
   const [tab, setTab] = useState<string>("create-request")
   return (
      <div className="h-full p-3 pt-0">
         <Tabs
            activeKey={tab}
            onChange={(key) => setTab(key)}
            items={[
               {
                  label: "Tạo yêu cầu",
                  key: "create-request",
               },
            ]}
         />
         {tab === "create-request" && <CreateRequestTab />}
      </div>
   )
}

export default Page
