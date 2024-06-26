"use client"

import { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { makeQueryClient } from "@/common/util/makeQueryClient.util"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { App, ConfigProvider } from "antd"
import { AntdRegistry } from "@ant-design/nextjs-registry"
import en_US from "antd/lib/locale/en_US"
import { enUSIntl, ProConfigProvider } from "@ant-design/pro-provider"

export default function GlobalProvider({ children }: Readonly<{ children: ReactNode }>) {
   const queryClient = makeQueryClient()

   return (
      <QueryClientProvider client={queryClient}>
         {/* This avoids TailwindCSS weird bugs, flashes, and missing utilities */}
         <AntdRegistry>
            <App className="h-full">
               {/* Config for Ant Design Pro-components (Set language to ENGLISH - packaged default is Chinese)*/}
               <ProConfigProvider intl={enUSIntl}>
                  {/* Config for Ant Design (Set language to ENGLISH) */}
                  <ConfigProvider locale={en_US}>{children}</ConfigProvider>
               </ProConfigProvider>
            </App>
         </AntdRegistry>

         {/* React Query Devtools */}
         <ReactQueryDevtools buttonPosition={"bottom-left"} />
      </QueryClientProvider>
   )
}
