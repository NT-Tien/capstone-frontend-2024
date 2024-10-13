"use client"

import { useQueries } from "@tanstack/react-query"
import Admin_Requests_Dashboard from "@/features/admin/api/request/dashboard.api"
import dayjs from "dayjs"

type Props = {
   areaIds: string[]
}

function Dashboard_GeneralInfoByArea(props: Props) {
   const api_requests = useQueries({
      queries: props.areaIds.map((areaId) => ({
         queryFn: () => Admin_Requests_Dashboard({
            areaId, type: "all", endDate: dayjs().add(1, "day").toISOString(),
            startDate: "2024-09-07T02:24:40.298Z",
         }),
         queryKey: ["admin", "dashboard", "area", areaId],
      })),
      combine: (result) => {
         return {

         }
      }
   })
}

export default Dashboard_GeneralInfoByArea