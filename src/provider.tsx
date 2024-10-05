"use client"

import DayjsProvider from "@/providers/dayjs.provider"
import EnvEditorProvider from "@/providers/EnvEditor.provider"
import ModalStackProvider from "@/providers/ModalStack.provider"
import { makeQueryClient } from "@/lib/utils/makeQueryClient.util"
import { AntdRegistry } from "@ant-design/nextjs-registry"
import { ProConfigProvider, viVNIntl } from "@ant-design/pro-provider"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { App, ConfigProvider, ConfigProviderProps, GetProp } from "antd"
import vi_VN from "antd/lib/locale/vi_VN"
import "dayjs/locale/vi"
import "moment/locale/vi"
import { ReactNode } from "react"
import SuperUserDrawerProvider from "@/providers/SuperUserDrawer.provider"

type WaveConfig = GetProp<ConfigProviderProps, "wave">

// Prepare effect holder
const createHolder = (node: HTMLElement) => {
   const { borderWidth } = getComputedStyle(node)
   const borderWidthNum = parseInt(borderWidth, 10)

   const div = document.createElement("div")
   div.style.position = "absolute"
   div.style.inset = `-${borderWidthNum}px`
   div.style.borderRadius = "inherit"
   div.style.background = "transparent"
   div.style.zIndex = "999"
   div.style.pointerEvents = "none"
   div.style.overflow = "hidden"
   node.appendChild(div)

   return div
}

const createDot = (holder: HTMLElement, color: string, left: number, top: number, size = 0) => {
   const dot = document.createElement("div")
   dot.style.position = "absolute"
   dot.style.left = `${left}px`
   dot.style.top = `${top}px`
   dot.style.width = `${size}px`
   dot.style.height = `${size}px`
   dot.style.borderRadius = "50%"
   dot.style.background = color
   dot.style.transform = "translate(-50%, -50%)"
   dot.style.transition = "all 0.5s ease-out"
   holder.appendChild(dot)

   return dot
}

// Inset Effect
const showInsetEffect: WaveConfig["showEffect"] = (node, { event, component }) => {
   if (component !== "Button") {
      return
   }

   const holder = createHolder(node)

   const rect = holder.getBoundingClientRect()

   const left = event.clientX - rect.left
   const top = event.clientY - rect.top

   let color = "rgba(255, 255, 255, 0.65)"

   if (node.className.includes("ant-btn-default") || node.className.includes("ant-btn-dashed")) {
      color = "rgba(0, 0, 0, 0.5)"
   }

   const dot = createDot(holder, color, left, top)

   // Motion
   requestAnimationFrame(() => {
      dot.ontransitionend = () => {
         holder.remove()
      }

      dot.style.width = "200px"
      dot.style.height = "200px"
      dot.style.opacity = "0"
   })
}

export default function IndexProvider({ children }: Readonly<{ children: ReactNode }>) {
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
                     wave={{ showEffect: showInsetEffect }}
                     theme={{
                        components: {
                           Result: {
                              colorTextDescription: "#737373",
                           },
                        },
                        token: {
                           colorPrimary: primaryColor,
                           colorInfo: primaryColor,
                           fontSize: 16,
                        },
                     }}
                     modal={{}}
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
