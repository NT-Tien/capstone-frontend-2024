import { PropsWithChildren } from "react"
import HeadMaintenance_NotificationsProvider from "@/features/head-maintenance/components/providers/notifications.provider"
import { ConfigProvider } from "antd"

function Layout(props: PropsWithChildren) {
   return (
      <ConfigProvider theme={{
         token: {
            colorPrimary: "#7f1d1d"
         }
      }}>
         <HeadMaintenance_NotificationsProvider>{props.children}</HeadMaintenance_NotificationsProvider>
      </ConfigProvider>
   )
}

export default Layout
