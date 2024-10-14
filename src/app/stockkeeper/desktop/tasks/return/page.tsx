"use client"

import { PageContainer } from "@ant-design/pro-layout"
import DesktopScannerDrawer from "@/components/overlays/DesktopScanner.drawer"
import Button from "antd/es/button"
import { useQueries } from "@tanstack/react-query"
import { stockkeeper_qk } from "@/features/stockkeeper/api/qk"
import Stockkeeper_Task_GetById from "@/features/stockkeeper/api/task/getById.api"
import { useMemo, useState } from "react"
import { TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import dayjs from "dayjs"
import { Descriptions, Table } from "antd"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"

function Page() {
   const [scannedResult, setScannedResult] = useState<string | null>(null)

   const api = useQueries({
      queries: [
         {
            queryKey: stockkeeper_qk.tasks.one_byId(scannedResult ?? ""),
            queryFn: () => Stockkeeper_Task_GetById({ id: scannedResult ?? "" }),
            enabled: !!scannedResult,
         },
      ],
      combine: (result) => ({
         task: result[0],
      }),
   })

   const spareParts = useMemo(() => {
      const failedIssues = api.task.data?.issues.filter((issue) => issue.status === IssueStatusEnum.FAILED)
      const issueSpareParts = failedIssues?.map((issue) => issue.issueSpareParts).flat()
      const result: {
         [key: string]: {
            sparePart: SparePartDto
            quantity: number
         }
      } = {}
      issueSpareParts?.forEach((issueSparePart) => {
         if (result[issueSparePart.sparePart.id]) {
            result[issueSparePart.sparePart.id].quantity += issueSparePart.quantity
         } else {
            result[issueSparePart.sparePart.id] = {
               sparePart: issueSparePart.sparePart,
               quantity: issueSparePart.quantity,
            }
         }
      })
      return result
   }, [api.task.data?.issues])

   return (
      <PageContainer
         title="Trả linh kiện"
         extra={<Button>Xác nhận trả linh kiện</Button>}
         content={
            <div>
               {!scannedResult && (
                  <DesktopScannerDrawer
                     onScan={(res) => {
                        setScannedResult(res)
                     }}
                     drawerProps={{
                        placement: "right",
                        width: "max-content",
                     }}
                  >
                     {(handleOpen) => (
                        <Button block onClick={handleOpen} size="large" type="primary">
                           Vui lòng quét QR tác vụ để tiếp tục
                        </Button>
                     )}
                  </DesktopScannerDrawer>
               )}
               {api.task.isSuccess && scannedResult && (
                  <div>
                     <Descriptions
                        items={[
                           {
                              label: "Tên tác vụ",
                              children: api.task.data?.name,
                              span: 3,
                           },
                           {
                              label: "Trạng thái",
                              children: TaskStatusTagMapper[api.task.data?.status ?? ""]?.text,
                           },
                           {
                              label: "Người sửa",
                              children: api.task.data?.fixer?.username ?? "-",
                           },
                           {
                              label: "Ngày sửa",
                              children: api.task.data?.fixerDate
                                 ? dayjs(api.task.data?.fixerDate).format("DD/MM/YYYY")
                                 : "-",
                           },
                           {
                              label: "Mức độ ưu tiên",
                              children: api.task.data?.priority ? "Ưu tiên" : "Bình thường",
                           },
                           {
                              label: "Linh kiện",
                              children: api.task.data.confirmReceipt ? "Đã lấy" : "Chưa lấy",
                           },
                        ]}
                     />
                  </div>
               )}
            </div>
         }
         tabProps={{
            className: !scannedResult ? "hidden" : "",
         }}
         tabList={[
            {
               tab: "Linh kiện được trả",
               key: "spare-part",
               children: (function SpareParts() {
                  return (
                     <Table
                        dataSource={Object.values(spareParts)}
                        pagination={false}
                        columns={[
                           {
                              key: "index",
                              title: "STT",
                              render: (_, __, index) => index + 1,
                              width: 50,
                           },
                           {
                              key: "name",
                              title: "Tên linh kiện",
                              dataIndex: ["sparePart", "name"],
                           },
                           {
                              key: "quantity",
                              title: "Số lượng",
                              dataIndex: "quantity",
                           },
                        ]}
                     />
                  )
               })(),
            },
         ]}
      ></PageContainer>
   )
}

export default Page
