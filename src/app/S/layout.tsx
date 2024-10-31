import { PropsWithChildren } from "react"
import Staff_NotificationsProvider from "@/features/staff/components/providers/notifications.provider"

function Layout(props: PropsWithChildren) {
   return <Staff_NotificationsProvider>{props.children}</Staff_NotificationsProvider>
}

export default Layout
