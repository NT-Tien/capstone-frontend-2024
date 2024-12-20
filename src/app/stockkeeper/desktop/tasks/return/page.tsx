"use client"

import DesktopScannerDrawer from "@/components/overlays/DesktopScanner.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { stockkeeper_qk } from "@/features/stockkeeper/api/qk"
import Stockkeeper_Task_GetById from "@/features/stockkeeper/api/task/getById.api"
import DualSignatureDrawer, {
   DualSignatureDrawerProps,
} from "@/features/stockkeeper/components/overlay/DualSignature.drawer"
import SparePart_UpdateQuantityModal, {
   SparePart_UpdateQuantityModalProps,
} from "@/features/stockkeeper/components/overlay/SparePart_UpdateQuantity.modal"
import UpdateQuantityModal, {
   UpdateQuantityModalProps,
} from "@/features/stockkeeper/components/overlay/UpdateQuantity.modal"
import stockkeeper_mutations from "@/features/stockkeeper/mutations"
import useDownloadImportSpareParts from "@/features/stockkeeper/useDownloadImportSpareParts"
import { ReturnToWarehouseTypeErrorId } from "@/lib/constants/Warranty"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { TaskType } from "@/lib/domain/Task/Task.dto"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { DownloadOutlined } from "@ant-design/icons"
import { PageContainer } from "@ant-design/pro-layout"
import { useQueries } from "@tanstack/react-query"
import { App, Descriptions, Table } from "antd"
import Button from "antd/es/button"
import dayjs from "dayjs"
import { useMemo, useRef, useState } from "react"

function Page() {
   const { message } = App.useApp()
   const [scannedResult, setScannedResult] = useState<string | null>(null)
   const [updated, setUpdated] = useState<string[]>([])

   const { handleDownload } = useDownloadImportSpareParts()

   const control_dualSignatureDrawer = useRef<RefType<DualSignatureDrawerProps>>(null)
   const control_sparePartUpdateQuantityModal = useRef<RefType<SparePart_UpdateQuantityModalProps>>(null)
   const mutate_updateSparePartQuantity = stockkeeper_mutations.sparePart.addQuantity({})

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

   const check_taskIsWarranty = useMemo(() => {
      if (!api.task.isSuccess) return

      if (
         TaskUtil.isTask_Warranty(api.task.data) &&
         api.task.data.issues.find((i) => i.typeError.id === ReturnToWarehouseTypeErrorId)
      ) {
         // do special shit
         return {
            task: api.task.data,
            returnToWarehouseIssue: api.task.data.issues.find((i) => i.typeError.id === ReturnToWarehouseTypeErrorId),
         }
      }

      return
   }, [api.task.data, api.task.isSuccess])

   const mutate_returnSpareParts = stockkeeper_mutations.task.returnSpareParts()
   const mutate_returnRemovedDevice = stockkeeper_mutations.device.returnRemovedDevice()
   const mutate_warrantyResolve = stockkeeper_mutations.issue.warranty_completeReturnDevice()

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
      console.log("machineModel:")
      console.log(api.task.data?.device_renew?.machineModel)
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
               title="Nhập kho"
               extra={
                  scannedResult ? (
                     <div className="flex items-center gap-3">
                        <Button onClick={handleOpen}>Quét lại</Button>
                        <Button
                           type="primary"
                           disabled={
                              // !!api.task.data?.return_spare_part_data &&
                              Object.keys(spareParts).length > 0 &&
                              updated.length !== Object.keys(spareParts).length ||
                              api.task.data?.renewed === true
                           }
                           onClick={() => control_dualSignatureDrawer.current?.handleOpen({})}
                        >
                           Xác nhận nhập kho
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
                           {scannedResult === api.task.data.id ? (
                              <div>
                                 <Descriptions
                                    items={[
                                       {
                                          label: "Tên tác vụ",
                                          children: api.task.data?.name,
                                          span: 3,
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
                                          label: "Mẫu máy",
                                          children: api.task.data?.device.machineModel.name,
                                       },
                                       // {
                                       //    label: "Trạng thái",
                                       //    children: api.task.data.return_spare_part_data ? "Đã trả" : "Chưa trả",
                                       // },
                                    ]}
                                 />
                                 {!check_taskIsWarranty && (
                                    <>
                                       <p className="mt-6 text-[16px] font-bold">Thông số máy mới</p>
                                       <Descriptions
                                          items={[
                                             {
                                                label: "Mã máy",
                                                children: api.task.data?.device_renew?.machineModel.id,
                                                span: 3,
                                             },
                                             {
                                                label: "Mẫu máy",
                                                children: api.task.data?.device_renew?.machineModel.name,
                                             },
                                             {
                                                label: "Nhà sản xuất",
                                                children: api.task.data?.device_renew?.machineModel.manufacturer,
                                             },
                                             {
                                                label: "Thời hạn bảo hành",
                                                children: api.task.data?.device_renew?.machineModel.warrantyTerm
                                                   ? dayjs(
                                                        api.task.data?.device_renew.machineModel.warrantyTerm,
                                                     ).format("DD/MM/YYYY")
                                                   : "-",
                                             },
                                          ]}
                                       />
                                    </>
                                 )}
                              </div>
                           ) : (
                              <Descriptions
                                 items={[
                                    {
                                       label: "Tên tác vụ",
                                       children: api.task.data?.name,
                                    },
                                    {
                                       label: "Mẫu máy",
                                       children: `${api.task.data?.device.machineModel.name} - ${api.task.data?.device.description}`,
                                    },
                                 ]}
                              />
                           )}
                        </div>
                     )}
                  </div>
               }
               tabProps={{
                  className: !scannedResult ? "hidden" : "",
               }}
               // tabBarExtraContent={
               //    <Button icon={<DownloadOutlined />} onClick={handleDownload}>
               //       Tải mẫu nhập linh kiện
               //    </Button>
               // }
               tabList={
                  api.task.data?.return_spare_part_data !== null
                     ? [
                          {
                             tab: "Linh kiện được trả",
                             key: "spare-part",
                             children: (
                                <>
                                   <Table
                                      dataSource={api.task.data?.return_spare_part_data as any}
                                      pagination={false}
                                      columns={[
                                         { key: "index", title: "STT", render: (_, __, index) => index + 1 },
                                         { key: "name", title: "Tên linh kiện", dataIndex: ["sparePart", "name"] },
                                         { key: "quantity", title: "Số lượng trả", dataIndex: "quantity" },
                                         {
                                            key: "actions",
                                            align: "right",
                                            render: (_, record: any) => (
                                               <div>
                                                  {!updated.includes(record.sparePart.id) && record.returned != true ? (
                                                     <Button
                                                        onClick={() => {
                                                           mutate_updateSparePartQuantity.mutate(
                                                              {
                                                                 sparePartId: record.sparePart.id,
                                                                 issueId: record.issue.id,
                                                                 payload: { quantity: record.quantity },
                                                              },
                                                              {
                                                                 onSuccess: () => {
                                                                    setUpdated((prev) => [...prev, record.sparePart.id])
                                                                    message.success("Cập nhật kho thành công!")
                                                                 },
                                                                 onError: () => {
                                                                    message.error("Cập nhật kho thất bại!")
                                                                 },
                                                              },
                                                           )
                                                        }}
                                                     >
                                                        Cập nhật kho
                                                     </Button>
                                                  ) : (
                                                     <Button disabled={true}>Đã trả</Button>
                                                  )}
                                               </div>
                                            ),
                                         },
                                      ]}
                                   />
                                   <OverlayControllerWithRef ref={control_sparePartUpdateQuantityModal}>
                                      <SparePart_UpdateQuantityModal issueId={api.task.data?.return_spare_part_data.sparePart.id} />
                                   </OverlayControllerWithRef>
                                </>
                             ),
                          },
                       ]
                     : [
                          {
                             tab: "Trả thiết bị",
                             key: "device",
                             children: (
                                <Descriptions
                                   items={[
                                      {
                                         label: "Tên mẫu máy",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.machineModel.name
                                            : api.task.data?.device.machineModel.name,
                                      },
                                      {
                                         label: "Mã thiết bị",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.deviceCode
                                            : api.task.data.device.deviceCode,
                                      },
                                      {
                                         label: "Nhà sản xuất",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.machineModel.manufacturer
                                            : api.task.data?.device.machineModel.manufacturer,
                                      },
                                      {
                                         label: "Số lượng mũi khâu",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.machineModel.needleType
                                            : api.task.data?.device.machineModel.needleType,
                                      },
                                      {
                                         label: "Tốc độ mũi khâu (spm)",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.machineModel.speed
                                            : api.task.data?.device.machineModel.speed,
                                      },
                                      {
                                         label: "Công suất",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.machineModel.power
                                            : api.task.data?.device.machineModel.power,
                                      },
                                      {
                                         label: "Động rộng mũi kim",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.machineModel.stitch
                                            : api.task.data?.device.machineModel.stitch,
                                      },
                                      {
                                         label: "Độ cao chân vịt",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.machineModel.presser
                                            : api.task.data?.device.machineModel.presser,
                                      },
                                      {
                                         label: "Cuốn suốt tự động",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.machineModel.lubrication
                                            : api.task.data?.device.machineModel.lubrication,
                                      },
                                      {
                                         label: "Điện áp",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.machineModel.voltage
                                            : api.task.data?.device.machineModel.voltage,
                                      },
                                      {
                                         label: "Chất liệu vải may",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.machineModel.fabric
                                            : api.task.data?.device.machineModel.fabric,
                                      },
                                      {
                                         label: "Kích thước",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.machineModel.size
                                            : api.task.data?.device.machineModel.size,
                                      },
                                      {
                                         label: "Tính năng đặc biệt",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.machineModel.features
                                            : api.task.data?.device.machineModel.features,
                                      },
                                      {
                                         label: "Mô tả",
                                         children: check_taskIsWarranty
                                            ? check_taskIsWarranty.task.device_static?.description
                                            : api.task.data?.device.description,
                                      },
                                   ]}
                                />
                             ),
                          },
                       ]
               }
            >
               <OverlayControllerWithRef ref={control_dualSignatureDrawer}>
                  <DualSignatureDrawer
                     onSubmit={(staff, stockkeeper) => {
                        if (!scannedResult) return

                        // WARRANTY START
                        if (check_taskIsWarranty && check_taskIsWarranty.returnToWarehouseIssue) {
                           mutate_warrantyResolve.mutate(
                              {
                                 id: check_taskIsWarranty.returnToWarehouseIssue.id,
                              },
                              {
                                 onSuccess: () => {
                                    setScannedResult(null) // Reset scanned result
                                    api.task.refetch() // Refresh task data
                                    control_dualSignatureDrawer.current?.handleClose() // Close the drawer
                                    setTimeout(() => {
                                       handleOpen() // Reopen scanner drawer after success
                                    }, 500)
                                 },
                              },
                           )
                           return
                        }
                        // WARRANTY END

                        const isSparePartReturn = Object.keys(spareParts).length > 0

                        if (isSparePartReturn) {
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
                                    setScannedResult(null) // Reset scanned result
                                    api.task.refetch() // Refresh task data
                                    control_dualSignatureDrawer.current?.handleClose() // Close the drawer
                                    setTimeout(() => {
                                       handleOpen() // Reopen scanner drawer after success
                                    }, 500)
                                 },
                                 onError: (error) => {
                                    message.error("Action failed. Please try again.")
                                    console.error(error)
                                 },
                              },
                           )
                        } else {
                           mutate_returnRemovedDevice.mutate(
                              {
                                 id: api.task.data?.device.id || "",
                                 taskId: api.task.data?.id || "",
                                 payload: {
                                    staff_signature: staff,
                                    stockkeeper_signature: stockkeeper,
                                 },
                              },
                              {
                                 onSuccess: () => {
                                    setScannedResult(null) // Reset scanned result
                                    api.task.refetch() // Refresh task data
                                    control_dualSignatureDrawer.current?.handleClose() // Close the drawer
                                    setTimeout(() => {
                                       handleOpen() // Reopen scanner drawer after success
                                    }, 500)
                                 },
                                 onError: (error) => {
                                    message.error("Action failed. Please try again.")
                                    console.error(error)
                                 },
                              },
                           )
                        }
                     }}
                  />
               </OverlayControllerWithRef>
            </PageContainer>
         )}
      </DesktopScannerDrawer>
   )
}

export default Page
