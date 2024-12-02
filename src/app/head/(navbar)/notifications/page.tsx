"use client"

import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import { cn } from "@/lib/utils/cn.util"
import { Segmented } from "antd"
import { useState } from "react"

function Page() {
   const [tab, setTab] = useState<"unread" | "all">("unread")

   return (
      <div>
         <PageHeaderV2
            title="Thông báo"
            prevButton={<PageHeaderV2.BackButton />}
            nextButton={<PageHeaderV2.InfoButton />}
            type="dark"
         />
         <div className="px-layout">
            <Segmented
               block
               className="bg-head_department"
               value={tab}
               onChange={(tab) => setTab(tab as any)}
               size="large"
               options={[
                  {
                     label: <div className={cn(tab !== "unread" && "text-black/50", 'text-base')}>Chưa đọc</div>,
                     value: "unread",
                  },
                  {
                     label: <div className={cn(tab !== "all" && "text-black/50", 'text-base')}>Tất cả</div>,
                     value: "all",
                  },
               ]}
            />
         </div>
      </div>
   )
}

export default Page
