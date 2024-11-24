import { PropsWithChildren } from "react"
import Staff_NotificationsProvider from "@/features/staff/components/providers/notifications.provider"
import { ConfigProvider } from "antd"

function Layout(props: PropsWithChildren) {
   return (
      <ConfigProvider
         theme={{
            token: {
               colorPrimary: "#e26f27",
            },
         }}
      >
         <Staff_NotificationsProvider>{props.children}</Staff_NotificationsProvider>
      </ConfigProvider>
   )
}

export default Layout
