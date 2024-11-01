import { ReactNode } from "react"
import HeadDepartment_NotificationsProvider from "@/features/head-department/components/providers/notifications.provider"

export default function Layout({ children }: { children: ReactNode }) {
   return <HeadDepartment_NotificationsProvider>{children}</HeadDepartment_NotificationsProvider>
}
