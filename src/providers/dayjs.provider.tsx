"use client"

import { ReactNode, useEffect } from "react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
// import "dayjs/locale/vi"

// dayjs.extend(utc)
// dayjs.extend(timezone)
// dayjs.locale("vi")
dayjs.extend(relativeTime)
// dayjs.tz.setDefault("Asia/Ho_Chi_Minh")

export default function DayjsProvider({ children }: { children: ReactNode }) {
   // useEffect(() => {
   //    dayjs.extend(utc)
   //    dayjs.extend(timezone)
   //    dayjs.locale("vi")
   //    dayjs.extend(relativeTime)
   //    dayjs.tz.setDefault("Asia/Ho_Chi_Minh")
   // }, [])

   return children
}
