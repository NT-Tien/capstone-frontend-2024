"use client"

import { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { makeQueryClient } from "@/common/util/makeQueryClient.util"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { App, ConfigProvider } from "antd"
import { AntdRegistry } from "@ant-design/nextjs-registry"
import en_US from "antd/lib/locale/en_US"
import { enUSIntl, ProConfigProvider } from "@ant-design/pro-provider"
import I18NProvider from "@/common/providers/i18n.provider"
import ModalStackProvider from "@/common/providers/modal-stack.provider"
import "moment/locale/vi"
import "dayjs/locale/vi"
import DayjsProvider from "@/common/providers/dayjs.provider"

export default function GlobalProvider({ children }: Readonly<{ children: ReactNode }>) {
   const queryClient = makeQueryClient()

   const primaryColor: string = "#3c6cf5"

   return (
      <QueryClientProvider client={queryClient}>
         {/* This avoids TailwindCSS weird bugs, flashes, and missing utilities */}
         <AntdRegistry>
            <App className="h-full">
               {/* Config for Ant Design Pro-components (Set language to ENGLISH - packaged default is Chinese)*/}
               <ProConfigProvider
                  intl={enUSIntl}
                  token={{
                     colorPrimary: primaryColor,
                     colorInfo: primaryColor,
                  }}
               >
                  {/* Config for Ant Design (Set language to ENGLISH) */}
                  <ConfigProvider
                     locale={en_US}
                     theme={{
                        token: {
                           colorPrimary: primaryColor,
                           colorInfo: primaryColor,
                        },
                     }}
                  >
                     <I18NProvider>
                        <DayjsProvider>
                           <ModalStackProvider>{children}</ModalStackProvider>
                        </DayjsProvider>
                     </I18NProvider>
                  </ConfigProvider>
               </ProConfigProvider>
            </App>
         </AntdRegistry>

         {/* React Query Devtools */}
         {/*<ReactQueryDevtools buttonPosition={"top-right"} />*/}
      </QueryClientProvider>
   )
}
