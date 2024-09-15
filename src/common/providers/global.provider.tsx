"use client"

import DayjsProvider from "@/common/providers/dayjs.provider"
import EnvEditorProvider from "@/common/providers/EnvEditor.provider"
import ModalStackProvider from "@/common/providers/modal-stack.provider"
import { makeQueryClient } from "@/common/util/makeQueryClient.util"
import { AntdRegistry } from "@ant-design/nextjs-registry"
import { ProConfigProvider, viVNIntl } from "@ant-design/pro-provider"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { App, ConfigProvider } from "antd"
import vi_VN from "antd/lib/locale/vi_VN"
import "dayjs/locale/vi"
import "moment/locale/vi"
import { ReactNode } from "react"

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
                  intl={viVNIntl}
                  token={{
                     colorPrimary: primaryColor,
                     colorInfo: primaryColor,
                  }}
               >
                  {/* Config for Ant Design (Set language to ENGLISH) */}
                  <ConfigProvider
                     locale={vi_VN}
                     theme={{
                        components: {
                           Result: {
                              colorTextDescription: "#737373",
                           }
                        },
                        token: {
                           colorPrimary: primaryColor,
                           colorInfo: primaryColor,
                           fontSize: 16,
                        },
                     }}
                     
                     modal={{
                        
                     }}
                  >
                     <DayjsProvider>
                        <ModalStackProvider>
                           <EnvEditorProvider>{children}</EnvEditorProvider>
                        </ModalStackProvider>
                     </DayjsProvider>
                  </ConfigProvider>
               </ProConfigProvider>
            </App>
         </AntdRegistry>

         {/* React Query Devtools */}
         <ReactQueryDevtools buttonPosition={"top-right"} />
      </QueryClientProvider>
   )
}
