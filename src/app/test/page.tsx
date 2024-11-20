"use client"

import DeviceDetails from "@/features/head-maintenance/components/DeviceDetails"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import AuthTokens from "@/lib/constants/AuthTokens"
import { Dayjs } from "dayjs"
import React from "react"

function Page() {
   const [date, setDate] = React.useState<Dayjs | undefined>()

   const device = head_maintenance_queries.device.one({
      id: "e9175635-8871-4006-8460-c3c394f1554c",
      token: AuthTokens.Head_Maintenance,
   })

   return <div className="p-layout">{device.isSuccess && <DeviceDetails device={device.data} />}</div>
}

export default Page
