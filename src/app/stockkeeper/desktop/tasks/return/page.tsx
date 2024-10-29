"use client"

import { PageContainer } from "@ant-design/pro-layout"
import DesktopScannerDrawer from "@/components/overlays/DesktopScanner.drawer"
import Button from "antd/es/button"
import { useQueries } from "@tanstack/react-query"
import { stockkeeper_qk } from "@/features/stockkeeper/api/qk"
import Stockkeeper_Task_GetById from "@/features/stockkeeper/api/task/getById.api"
import { useMemo, useRef, useState } from "react"
import { TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import dayjs from "dayjs"
import { App, Descriptions, Table } from "antd"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import UpdateSparePartQuantityModal, {
   UpdateSparePartQuantityModalRefType,
} from "@/features/stockkeeper/components/overlay/UpdateSparePartQuantity.modal"
import UpdateQuantityModal, {
   UpdateQuantityModalProps,
} from "@/features/stockkeeper/components/overlay/UpdateQuantity.modal"
import DualSignatureDrawer, {
   DualSignatureDrawerProps,
} from "@/features/stockkeeper/components/overlay/DualSignature.drawer"
import stockkeeper_mutations from "@/features/stockkeeper/mutations"
import Link from "next/link"
import { CopyOutlined, DownloadOutlined } from "@ant-design/icons"
import useDownloadImportSpareParts from "@/features/stockkeeper/useDownloadImportSpareParts"

function Page() {
   const { message } = App.useApp()
   const [scannedResult, setScannedResult] = useState<string | null>(null)
   const [updated, setUpdated] = useState<string[]>([])

   const { handleDownload } = useDownloadImportSpareParts()

   const control_updateSparePartQuantityModal = useRef<RefType<UpdateQuantityModalProps>>(null)
   const control_dualSignatureDrawer = useRef<RefType<DualSignatureDrawerProps>>(null)

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

   const mutate_returnSpareParts = stockkeeper_mutations.task.returnSpareParts()

   const spareParts = useMemo(() => {
      const failedIssues = api.task.data?.issues.filter(
         (issue) =>
            issue.status === IssueStatusEnum.FAILED &&
            !issue.returnSparePartsStaffSignature &&
            !issue.returnSparePartsStaffSignature,
      )
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
            <PageContainer
               title="Trả linh kiện"
               extra={
                  scannedResult ? (
                     <div className="flex items-center gap-3">
                        <Button onClick={handleOpen}>Quét lại</Button>
                        <Button
                           type="primary"
                           disabled={!!api.task.data?.return_spare_part_data}
                           onClick={() => control_dualSignatureDrawer.current?.handleOpen({})}
                        >
                           Xác nhận trả linh kiện
                        </Button>
                     </div>
                  ) : undefined
               }
               content={
                  <div>
                     {!scannedResult && (
                        <Button block onClick={handleOpen} size="large" type="primary">
                           Vui lòng quét QR tác vụ để tiếp tục
                        </Button>
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
                                 {
                                    label: "Mẫu máy",
                                    children: api.task.data?.device.machineModel.name,
                                 },
                                 {
                                    label: "Trả linh kiện",
                                    children: api.task.data.return_spare_part_data ? "Đã trả" : "Chưa trả",
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
               tabBarExtraContent={
                  <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                     Tải mẫu nhập linh kiện
                  </Button>
               }
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
                                    render: (_, e) => (
                                       <a
                                          onClick={() => {
                                             message.destroy("copy")
                                             navigator.clipboard.writeText(e.sparePart.id)
                                             message.success({
                                                content: "Đã sao chép mã linh kiện",
                                                key: "copy",
                                             })
                                          }}
                                          className={"flex items-center gap-2"}
                                       >
                                          {e.sparePart.name}
                                          <CopyOutlined />
                                       </a>
                                    ),
                                 },
                                 {
                                    key: "quantity",
                                    title: "Số lượng trả",
                                    dataIndex: "quantity",
                                 },
                              ]}
                           />
                        )
                     })(),
                  },
               ]}
            >
               <OverlayControllerWithRef ref={control_updateSparePartQuantityModal}>
                  <UpdateQuantityModal
                     refetchFn={async (sparePartId) => {
                        control_updateSparePartQuantityModal.current?.handleClose()
                        setUpdated((prev) => [...prev, sparePartId])
                        await api.task.refetch()
                     }}
                  />
               </OverlayControllerWithRef>
               <OverlayControllerWithRef ref={control_dualSignatureDrawer}>
                  <DualSignatureDrawer
                     onSubmit={(staff, stockkeeper) => {
                        if (!scannedResult) return
                        mutate_returnSpareParts.mutate(
                           {
                              id: scannedResult,
                              payload: {
                                 staff_signature: staff,
                                 stockkeeper_signature: stockkeeper,
                              },
                           },
                           {
                              onSuccess: () => {
                                 api.task.refetch()
                                 control_dualSignatureDrawer.current?.handleClose()
                                 setTimeout(() => {
                                    handleOpen()
                                 }, 500)
                              },
                           },
                        )
                     }}
                  />
               </OverlayControllerWithRef>
            </PageContainer>
         )}
      </DesktopScannerDrawer>
   )
}

export default Page
