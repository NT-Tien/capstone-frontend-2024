"use client"

import { Skeleton } from "antd"
import HomeHeader from "@/common/components/HomeHeader"

export default function DashboardPage() {
   return (
      <div className="std-layout">
         <HomeHeader className="std-layout-inner pb-8 pt-4" />
         <Skeleton.Button className="h-64 w-full" />
      </div>
   )
}
