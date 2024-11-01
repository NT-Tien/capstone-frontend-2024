import { PropsWithChildren } from "react"
import HeadMaintenance_NotificationsProvider from "@/features/head-maintenance/components/providers/notifications.provider"

function Layout(props: PropsWithChildren) {
   return <HeadMaintenance_NotificationsProvider>{props.children}</HeadMaintenance_NotificationsProvider>
}

export default Layout
