"use client"

import { Skeleton } from "antd"
import { CapsuleTabs } from "antd-mobile"
import HomeHeader from "@/common/components/HomeHeader"

export default function DashboardPage() {
   return (
      <div>
         <HomeHeader className="p-4 pb-2" />
         <CapsuleTabs>
            <CapsuleTabs.Tab title="Tab 1" key="1">
               <div className="grid grid-cols-1 gap-5 overflow-y-auto">
                  <Skeleton.Input block className="h-32 w-full" />
                  <Skeleton.Input block className="h-32 w-full" />
                  <Skeleton.Input block className="h-64 w-full" />
                  <Skeleton.Input block className="h-32 w-full" />
               </div>
            </CapsuleTabs.Tab>
            <CapsuleTabs.Tab title="Tab 2" key="2">
               <div className="grid grid-cols-1 gap-5 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-5">
                     <Skeleton.Input block className="h-32 w-full" />
                     <Skeleton.Input block className="h-32 w-full" />
                  </div>
                  <Skeleton.Input block className="h-32 w-full" />
                  <Skeleton.Input block className="h-64 w-full" />
                  <Skeleton.Input block className="h-32 w-full" />
               </div>
            </CapsuleTabs.Tab>
            <CapsuleTabs.Tab title="Tab 3" key="3">
               <div className="grid grid-cols-1 gap-5 overflow-y-auto">
                  <Skeleton.Input block className="h-64 w-full" />
                  <Skeleton.Input block className="h-32 w-full" />
                  <Skeleton.Input block className="h-32 w-full" />
                  <Skeleton.Input block className="h-32 w-full" />
               </div>
            </CapsuleTabs.Tab>
            <CapsuleTabs.Tab title="Tab 4" key="4">
               <div className="grid grid-cols-1 gap-5 overflow-y-auto">
                  <Skeleton.Input block className="h-32 w-full" />
                  <Skeleton.Input block className="h-64 w-full" />
                  <Skeleton.Input block className="h-48 w-full" />
                  <Skeleton.Input block className="h-32 w-full" />
               </div>
            </CapsuleTabs.Tab>
         </CapsuleTabs>
      </div>
   )
}
