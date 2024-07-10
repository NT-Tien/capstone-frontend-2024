"use client"

import { Skeleton } from "antd"
import HomeHeader from "@/common/components/HomeHeader"

export default function DashboardPage() {
   return (
      <div className="std-layout">
         <HomeHeader className="pb-8 pt-4" />
         <Skeleton.Input block className="mb-3 h-32 w-full" />
         <Skeleton.Input block className="mb-3 h-32 w-full" />
         <Skeleton.Input block className="mb-3 h-64 w-full" />
         <Skeleton.Input block className="h-32 w-full" />
      </div>
   )
}
