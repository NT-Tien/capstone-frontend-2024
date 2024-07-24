"use client"

import React, { useState } from "react"
import { Hourglass, ThumbsUp, XCircle } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"

export default function TestPage() {
   const [tab, setTab] = useState<string>("pending")
   const router = useRouter()

   const tabs = [
      {
         key: "pending",
         title: "Đang chờ",
         icon: <Hourglass size={20} />,
         children: "pending",
      },
      {
         key: "approved",
         title: "Đã duyệt",
         icon: <ThumbsUp size={20} />,
         children: "appoved",
      },
      {
         key: "rejected",
         title: "Từ chối",
         icon: <XCircle size={20} />,
         children: "reje",
      },
      {
         key: "in-progress",
         title: "Đang xử lý",
         icon: <Hourglass size={20} />,
         children: "progre",
      },
      {
         key: "closed",
         title: "Đã đóng",
         icon: <XCircle size={20} />,
         children: "close",
      },
   ]

   return (
      <div className="w-screen">
         {/*<RootHeader title="Test Page" className="p-4" />*/}
         {/*<ScrollableTabs items={tabs} tab={tab} onTabChange={setTab} />*/}

         <h1>Outside</h1>
         <button onClick={() => router.push("/test/inside")}>Go Inside</button>
         <div></div>
      </div>
   )
}
