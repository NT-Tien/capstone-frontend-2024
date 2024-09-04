"use client"

import { useQueries } from "@tanstack/react-query"
import { admin_qk } from "../../_api/qk"
import Admin_Requests_All from "../../_api/requests/all.api"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { useMemo, useState } from "react"
import PieChart from "@/common/components/PieChart"
import { Card, Empty, Select, Spin } from "antd"

export default function WarrantyOrFixRequests() {
   const [select, setSelect] = useState<1 | 2 | 3>(1)

   const api = useQueries({
      queries: [
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.APPROVED, time: select }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.APPROVED, time: select }),
         },
         {
            queryKey: admin_qk.requests.all({
               page: 1,
               limit: 500,
               status: FixRequestStatus.IN_PROGRESS,
               time: select,
            }),
            queryFn: () =>
               Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.IN_PROGRESS, time: select }),
         },
         {
            queryKey: admin_qk.requests.all({
               page: 1,
               limit: 500,
               status: FixRequestStatus.HEAD_CONFIRM,
               time: select,
            }),
            queryFn: () =>
               Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.HEAD_CONFIRM, time: select }),
         },
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.CLOSED, time: select }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.CLOSED, time: select }),
         },
      ],
      combine: (result) => {
         return {
            approved: result[0],
            in_progress: result[1],
            head_confirm: result[2],
            closed: result[3],
         }
      },
   })

   const filtered = useMemo(() => {
      if (!api.approved.isSuccess || !api.in_progress.isSuccess || !api.head_confirm.isSuccess || !api.closed.isSuccess)
         return null

      const all = [
         ...api.approved.data.list,
         ...api.in_progress.data.list,
         ...api.head_confirm.data.list,
         ...api.closed.data.list,
      ]

      let returnValue = {
         warranty: 0,
         fix: 0,
      }

      all.forEach((item) => {
         if (item.is_warranty) {
            returnValue.warranty++
         } else {
            returnValue.fix++
         }
      })

      return returnValue
   }, [
      api.approved.data?.list,
      api.approved.isSuccess,
      api.closed.data?.list,
      api.closed.isSuccess,
      api.head_confirm.data?.list,
      api.head_confirm.isSuccess,
      api.in_progress.data?.list,
      api.in_progress.isSuccess,
   ])

   return (
      <Card size="small" className="w-full">
         <header className="mb-3 flex justify-between">
            <h3 className="text-lg font-semibold">Loại yêu cầu</h3>
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
            api.closed.isSuccess &&
            api.head_confirm.isSuccess &&
            api.in_progress.isSuccess &&
            (api.approved.data.list.length > 0 ||
            api.closed.data.list.length > 0 ||
            api.head_confirm.data.list.length > 0 ||
            api.in_progress.data.list.length > 0 ? (
               <PieChart
                  series={[filtered?.fix || 0, filtered?.warranty || 0]}
                  text={["Sửa chữa", "Bảo hành"]}
                  colors={["rgb(253, 166, 35)", "rgb(32, 40, 190)"]}
               />
            ) : (
               <div className="py-6">
                  <Empty description="Không có dữ liệu" />
               </div>
            ))}
         {(api.approved.isPending ||
            api.closed.isPending ||
            api.head_confirm.isPending ||
            api.in_progress.isPending) && (
            <div className="grid h-full w-full place-items-center">
               <Spin />
            </div>
         )}

         {api.approved.isError && <div>{api.approved.error.message}</div>}
         {api.closed.isError && <div>{api.closed.error.message}</div>}
         {api.head_confirm.isError && <div>{api.head_confirm.error.message}</div>}
         {api.in_progress.isError && <div>{api.in_progress.error.message}</div>}
      </Card>
   )
}
