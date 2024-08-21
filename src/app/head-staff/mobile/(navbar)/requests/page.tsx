"use client"

import PageHeader from "@/common/components/PageHeader"
import { AddressBook } from "@phosphor-icons/react"
import Image from "next/image"
import { useState } from "react"
import RequestCard from "./RequestCard"

function Page() {
   const [tab, setTab] = useState<string>("pending")

   return (
      <div className="std-layout relative h-full min-h-full bg-white">
         <PageHeader title="Yêu cầu" icon={AddressBook} className="std-layout-outer relative z-30" />
         <Image
            className="std-layout-outer absolute left-0 top-0 z-0 h-24 w-full object-fill opacity-40"
            src="/images/requests.jpg"
            width={784}
            height={240}
            alt="image"
         />
         <input
            type="text"
            className="relative z-30 w-full rounded-full border border-neutral-200 bg-neutral-100 px-4 py-3"
            placeholder="Search..."
         />

         {/* <Segmented
            block
            value={tab}
            onChange={setTab}
            size="large"
            className="mt-layout py-3"
            options={[
               {
                  value: "pending",
                  label: <span>Chưa xử lý</span>,
               },
               {
                  value: "approved",
                  label: <span>Đã xác nhận</span>,
               },
               {
                  value: "in_progress",
                  label: <span>Đang xử lý</span>,
               },
               {
                  value: "head_confirm",
                  label: <span>Chờ kiểm tra</span>,
               },
            ]}
         /> */}
         <RequestCard />
      </div>
   )
}

export default Page
