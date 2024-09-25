"use client"

import { stockkeeper_qk } from "@/app/stockkeeper/_api/qk"
import Stockkeeper_Task_GetById from "@/app/stockkeeper/_api/task/getById.api"
import Stockkeeper_Task_ReceiveSpareParts from "@/app/stockkeeper/_api/task/receive-spare-parts.api"
import CreateSignatureDrawer, { CreateSignatureDrawerRefType } from "@/components/overlays/CreateSignature.drawer"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import AlertCard from "@/components/AlertCard"
import DesktopScannerDrawer from "@/components/overlays/DesktopScanner.drawer"
import { PageContainer } from "@ant-design/pro-components"
import { useMutation, useQueries } from "@tanstack/react-query"
import { Button, Descriptions, message, App, Table } from "antd"
import dayjs from "dayjs"
import { useState, useRef, useMemo } from "react"

function Page({ searchParams }: { searchParams: { taskid?: string } }) {
   const { message } = App.useApp()

   const [scannedResult, setScannedResult] = useState<string | null>(searchParams.taskid ?? null)

   const createSignatureDrawerRef = useRef<CreateSignatureDrawerRefType | null>(null)

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
         spareParts: {
            ...result[0],
            data: result[0].data?.issues.flatMap((i) => i.issueSpareParts) ?? [],
         },
      }),
   })

   const mutate_confirmReceipt = useMutation({
      mutationFn: Stockkeeper_Task_ReceiveSpareParts,
      onMutate: async () => {
         message.destroy("confirmReceipt")
         message.loading({
            content: "Đang thực hiện...",
            key: "confirmReceipt",
         })
      },
      onError: async (e) => {
         message.error({
            content: e.message,
            key: "confirmReceipt",
         })
      },
      onSuccess: async () => {
         message.success({
            content: "Thành công",
         })
      },
      onSettled: () => {
         message.destroy("confirmReceipt")
      },
   })

   const hasSparePartsAndCollected = useMemo(() => {
      return api.spareParts.data?.length > 0 && api.task.data?.confirmReceipt
   }, [api.spareParts.data, api.task.data?.confirmReceipt])

   const hasSparePartsButNotCollected = useMemo(() => {
      return api.spareParts.data?.length > 0 && !api.task.data?.confirmReceipt
   }, [api.spareParts.data, api.task.data?.confirmReceipt])

   const hasNoSpareParts = useMemo(() => {
      return api.spareParts.data?.length === 0
   }, [api.spareParts.data])

   return (
      <DesktopScannerDrawer
         drawerProps={{
            placement: "right",
            width: "max-content",
         }}
         onScan={(res) => {
            setScannedResult(res)
         }}
      >
         {(handleOpen) => (
            <PageContainer
               title={`Quét QR`}
               extra={[
                  <Button key="back" onClick={() => handleOpen()} className={cn(!scannedResult && "hidden")}>
                     Quét lại
                  </Button>,
                  <Button
                     key="complete"
                     className={cn(
                        (!scannedResult ||
                           hasSparePartsAndCollected ||
                           hasNoSpareParts ||
                           api.task.data?.status !== TaskStatus.ASSIGNED) &&
                           "hidden",
                     )}
                     type="primary"
                     onClick={() => createSignatureDrawerRef.current?.handleOpen()}
                  >
                     Hoàn tất lấy linh kiện
                  </Button>,
               ]}
               content={
                  <>
                     {!scannedResult && (
                        <div>
                           <Button type="primary" className="w-full" size="large" onClick={() => handleOpen()}>
                              Mở màn hình quét
                           </Button>
                           {/* <section className="mt-layout">
                              <h5 className="text-base font-medium">Lịch sử quét</h5>
                           </section> */}
                        </div>
                     )}

                     {scannedResult && api.task.isSuccess && (
                        <div>
                           {!hasSparePartsButNotCollected && (
                              <AlertCard text="Nhân viên chưa lấy linh kiện cho tác vụ này" className="mb-layout" />
                           )}
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
                  </>
               }
               tabProps={{
                  className: !scannedResult ? "hidden" : "",
               }}
               tabList={[
                  {
                     tab: "Linh kiện",
                     key: "spare-parts",
                     children: (function SpareParts() {
                        return (
                           <Table
                              dataSource={api.spareParts.data}
                              loading={api.spareParts.isPending}
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
                  //   {
                  //      tab: "Thiết bị",
                  //      key: "device",
                  //      children: (function Device() {
                  //         return (
                  //            <Descriptions
                  //               bordered
                  //               items={[
                  //                  {
                  //                     label: "Tên thiết bị",
                  //                     children: api.task.data?.device?.machineModel.name,
                  //                     span: 3,
                  //                  },
                  //                  {
                  //                     label: "Nhà sản xuất",
                  //                     children: api.task.data?.device?.machineModel.manufacturer,
                  //                  },
                  //                  {
                  //                     label: "Khu vực",
                  //                     children: api.task.data?.device?.area?.name,
                  //                  },
                  //               ]}
                  //            />
                  //         )
                  //      })(),
                  //   },
               ]}
            >
               <CreateSignatureDrawer
                  drawerProps={{
                     placement: "right",
                     width: "30vw",
                  }}
                  text="Tôi xác nhận nhân viên đã lấy linh kiện thành công"
                  ref={createSignatureDrawerRef}
                  onSubmit={(signature) => {
                     if (!scannedResult || !api.task.isSuccess) return
                     mutate_confirmReceipt.mutate(
                        {
                           id: api.task.data.id,
                           payload: {
                              signature,
                           },
                        },
                        {
                           onSuccess: async () => {
                              await api.task.refetch()
                              createSignatureDrawerRef.current?.handleClose()
                              setTimeout(() => {
                                 handleOpen()
                              }, 300)
                           },
                        },
                     )
                  }}
               />
            </PageContainer>
         )}
      </DesktopScannerDrawer>
   )
}

export default Page
