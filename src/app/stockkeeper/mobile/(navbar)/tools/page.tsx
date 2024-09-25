"use client"

import RootHeader from "@/components/layout/RootHeader"
import { ToolOutlined, ScanOutlined } from "@ant-design/icons"
import { CheckSquareOffset, Gear, Scan } from "@phosphor-icons/react"
import Link from "next/link"

function Page() {
   return (
      <div className="std-layout">
         <RootHeader title="Công cụ" className="std-layout-outer p-4" icon={<ToolOutlined />} />
         <div className="mt-layout grid grid-cols-3 rounded-md border-neutral-100 bg-white p-2 gap-2">
            <Link href="/stockkeeper/mobile/spare-parts" className="text-black hover:text-black">
               <div className="grid w-full place-items-center gap-1">
                  <Gear size={36} weight="duotone" className="text-red-500" />
                  <div className="w-3/4 text-center text-xs font-light text-neutral-700">Linh kiện</div>
               </div>
            </Link>
            <Link href="/stockkeeper/mobile/tasks" className="text-black hover:text-black">
               <div className="grid w-full place-items-center gap-1">
                  <CheckSquareOffset size={36} weight="duotone" className="text-blue-500" />
                  <div className="w-3/4 text-center text-xs font-light text-neutral-700">Tác vụ chờ linh kiện</div>
               </div>
            </Link>
            <Link href="/stockkeeper/mobile/scan" className="text-black hover:text-black">
               <div className="grid w-full place-items-center gap-1">
                  <Scan size={36} weight="duotone" className="text-green-500" />
                  <div className="w-3/4 text-center text-xs font-light text-neutral-700">Quét QR</div>
               </div>
            </Link>
            <Link href="/stockkeeper/mobile/spare-parts" className="text-black hover:text-black">
               <div className="grid w-full place-items-center gap-1">
                  <Gear size={36} weight="duotone" className="text-red-500" />
                  <div className="w-3/4 text-center text-xs font-light text-neutral-700">Linh kiện còn thiếu</div>
               </div>
            </Link>
         </div>
      </div>
   )
}

export default Page
