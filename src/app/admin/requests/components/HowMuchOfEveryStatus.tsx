import { useQueries, UseQueryResult } from "@tanstack/react-query"
import { admin_qk } from "../../_api/qk"
import Admin_Requests_All from "../../_api/requests/all.api"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { Statistic, StatisticCard } from "@ant-design/pro-components"
import PieChart from "@/common/components/PieChart"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { useState } from "react"
import { Select } from "antd"

export default function HowMuchOfEveryStatus() {

    const [select, setSelect] = useState<1 | 2 | 3>(1)

   const api = useQueries({
      queries: [
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.PENDING, time: select }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.PENDING, time: select }),
         },
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.APPROVED, time: select }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.APPROVED, time: select }),
         },
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.IN_PROGRESS, time: select }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.IN_PROGRESS, time: select }),
         },
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.HEAD_CONFIRM, time: select }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.HEAD_CONFIRM, time: select }),
         },
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.REJECTED, time: select }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.REJECTED, time: select }),
         },
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.CLOSED, time: select }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.CLOSED, time: select }),
         },
      ],
      combine: (result) => {
         return {
            pending: result[0],
            approved: result[1],
            in_progress: result[2],
            head_confirm: result[3],
            rejected: result[4],
            closed: result[5],
         }
      },
   })

   return (
      <div>
        <header className="mb-3 flex justify-between">
            <h3 className="text-lg font-semibold">Số lượng yêu cầu</h3>
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
        <div className="grid grid-cols-2">
         <CustomCard name="Đang chờ" color="rgb(255, 99, 132)" api={api.pending} />
         <CustomCard name="Đã duyệt" color="rgb(54, 162, 235)" api={api.approved} />
         <CustomCard name="Đang xử lý" color="rgb(255, 205, 86)" api={api.in_progress} />
         <CustomCard name="Đã xác nhận" color="rgb(75, 192, 192)" api={api.head_confirm} />
         <CustomCard name="Đã hủy" color="rgb(153, 102, 255)" api={api.rejected} />
         <CustomCard name="Đã đóng" color="rgb(255, 159, 64)" api={api.closed} />
      </div>
      </div>
   )
}

type CustomCardProps = {
   name: string
   color: string
   api: UseQueryResult<
      {
         list: FixRequestDto[]
         total: number
      },
      Error
   >
}

function CustomCard({ api, name, color }: CustomCardProps) {
   return (
      <StatisticCard
         statistic={{
            title: name,
            value: api.isSuccess ? api.data.list.length : 0,
         }}
         chart={
            api.isSuccess && api.data.list.length > 0 ? (
               <PieChart series={[api.data.list.length]} text={[name]} colors={[color]} width={125} height={125} />
            ) : (
               <PieChart series={[100]} text={["Không có"]} colors={["rgb(235, 235, 235)"]} width={125} height={125} />
            )
         }
         chartPlacement="left"
      />
   )
}
