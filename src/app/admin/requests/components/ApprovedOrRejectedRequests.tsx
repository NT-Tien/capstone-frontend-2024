"use client"

import { useQueries } from "@tanstack/react-query"
import { admin_qk } from "../../_api/qk"
import Admin_Requests_All from "../../_api/requests/all.api"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { useMemo, useState } from "react"
import PieChart from "@/common/components/PieChart"
import { Card, Empty, Select, Spin } from "antd"

export default function ApprovedOrRejectedRequests() {
   const [select, setSelect] = useState<1 | 2 | 3>(1)

   const api = useQueries({
      queries: [
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.APPROVED, time: select }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.APPROVED, time: select }),
         },
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.REJECTED, time: select }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.REJECTED, time: select }),
         },
      ],
      combine: (result) => {
         return {
            approved: result[0],
            rejected: result[1],
         }
      },
   })

   return (
      <Card size="small" className="w-full">
         <header className="mb-3 flex justify-between">
            <h3 className="text-lg font-semibold">Trạng thái yêu cầu</h3>
            <Select
               value={select}
               onChange={(value) => setSelect(value)}
               options={[
                  {
                     label: "7 ngày qua",
                     value: 1,
                  },
                  {
                     label: "30 ngày qua",
                     value: 2,
                  },
                  {
                     label: "365 ngày qua",
                     value: 3,
                  },
               ]}
            ></Select>
         </header>
         {api.approved.isSuccess &&
            api.rejected.isSuccess &&
            (api.approved.data.list.length > 0 || api.rejected.data.list.length > 0 ? (
               <PieChart
                  series={[api.approved.data.list.length, api.rejected.data.list.length]}
                  text={["Đã duyệt", "Đã hủy"]}
                  colors={["rgb(253, 166, 35)", "rgb(32, 40, 190)"]}
               />
            ) : (
               <div className="py-6">
                  <Empty description="Không có dữ liệu" />
               </div>
            ))}
         {(api.approved.isPending || api.rejected.isPending) && (
            <div className="grid place-items-center w-full h-full">
               <Spin />
            </div>
         )}

         {api.approved.isError && <div>{api.approved.error.message}</div>}
         {api.rejected.isError && <div>{api.rejected.error.message}</div>}
      </Card>
   )
}
