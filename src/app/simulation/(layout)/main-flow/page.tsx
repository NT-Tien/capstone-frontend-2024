"use client"

import Button from "antd/es/button"
import { Tabs } from "antd"
import { useState } from "react"

function Page() {
   const [tab, setTab] = useState<string>("create-request")
   return (
      <div className="p-3 pt-0">
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
         {tab === "create-request" && <div>Test</div>}
      </div>
   )
}

export default Page
