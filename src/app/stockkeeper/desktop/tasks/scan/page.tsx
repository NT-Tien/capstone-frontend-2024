"use client"

import { stockkeeper_qk } from "@/features/stockkeeper/api/qk"
import Stockkeeper_Task_GetById from "@/features/stockkeeper/api/task/getById.api"
import Stockkeeper_Task_ReceiveSpareParts from "@/features/stockkeeper/api/task/receive-spare-parts.api"
import CreateSignatureDrawer, { CreateSignatureDrawerRefType } from "@/components/overlays/CreateSignature.drawer"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import AlertCard from "@/components/AlertCard"
import DesktopScannerDrawer from "@/components/overlays/DesktopScanner.drawer"
import { PageContainer, ProTable } from "@ant-design/pro-components"
import { useMutation, useQueries } from "@tanstack/react-query"
import { Button, Descriptions, message, App, Table, Dropdown, List, Tag, Checkbox } from "antd"
import dayjs from "dayjs"
import { useState, useRef, useMemo } from "react"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import DualSignatureDrawer, {
   DualSignatureDrawerProps,
} from "@/features/stockkeeper/components/overlay/DualSignature.drawer"
import { EditOutlined, MoreOutlined, UndoOutlined } from "@ant-design/icons"
import SparePart_CannotExportModal, {
   SparePart_CannotExportModalProps,
} from "@/features/stockkeeper/components/overlay/SparePart_CannotExport.modal"
import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import stockkeeper_mutations from "@/features/stockkeeper/mutations"
import Stockkeeper_MachineModel_GetById from "@/features/stockkeeper/api/machine-model/getById.api"
import { TaskType } from "@/lib/domain/Task/Task.dto"

function Page({ searchParams }: { searchParams: { taskid?: string } }) {
   const { message } = App.useApp()

   const [scannedResult, setScannedResult] = useState<string | null>(searchParams.taskid ?? null)
   const [failedIssues, setFailedIssues] = useState<{
      [issueId: string]: {
         reason: string
      }
   }>({})

   const createSignatureDrawerRef = useRef<CreateSignatureDrawerRefType | null>(null)
   const control_dualSignatureDrawer = useRef<RefType<DualSignatureDrawerProps>>(null)
   const control_sparePartCannotExportModal = useRef<RefType<SparePart_CannotExportModalProps>>(null)

   const mutate_failIssues = stockkeeper_mutations.issue.failMany()

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
            data: result[0].data?.issues.flatMap((issue: IssueDto) => issue.issueSpareParts),
         },
      }),
   })

   const api_machineModel = useQueries({
      queries: [
         {
            queryKey: stockkeeper_qk.machineModel.one_byId(api.task.data?.device_renew.machineModel.id ?? ""),
            queryFn: () => Stockkeeper_MachineModel_GetById({ id: api.task.data?.device_renew.machineModel.id ?? "" }),
            enabled: !!api.task.data?.device_renew.machineModel.id,
         },
      ],
   })
   const [selectedDevices, setSelectedDevices] = useState<string[]>([])

   const handleCheckboxChange = (deviceId: string, checked: boolean) => {
      setSelectedDevices((prev) => (checked ? [...prev, deviceId] : prev.filter((id) => id !== deviceId)))
   }

   const lazy_spareParts = useMemo(() => {
      const returnValue: {
         [sparePartId: string]: {
            sparePart: SparePartDto
            quantity: number
            issues: IssueDto[]
            key: string
         }
      } = {}

      for (const issue of api.task.data?.issues ?? []) {
         for (const issueSparePart of issue.issueSpareParts) {
            if (!returnValue[issueSparePart.sparePart.id]) {
               returnValue[issueSparePart.sparePart.id] = {
                  key: issueSparePart.sparePart.id,
                  sparePart: issueSparePart.sparePart,
                  quantity: 0,
                  issues: [],
               }
            }
            returnValue[issueSparePart.sparePart.id].quantity += issueSparePart.quantity
            returnValue[issueSparePart.sparePart.id].issues.push(issue)
         }
      }

      return returnValue
   }, [api.task.data?.issues])

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
      return api.spareParts.data && api.spareParts.data?.length > 0 && api.task.data?.confirmReceipt
   }, [api.spareParts.data, api.task.data?.confirmReceipt])

   const hasSparePartsButNotCollected = useMemo(() => {
      return api.spareParts.data && api.spareParts.data?.length > 0 && !api.task.data?.confirmReceipt
   }, [api.spareParts.data, api.task.data?.confirmReceipt])

   const hasNoSpareParts = useMemo(() => {
      return api.spareParts.data?.length === 0
   }, [api.spareParts.data?.length])

   const isRenewAndCollected = useMemo(() => {
      return api.task.data?.device_renew && api.task.data?.confirmReceipt
   }, [api.task.data?.confirmReceipt, api.task.data?.device_renew])

   const isRenewAndNotCollected = useMemo(() => {
      return api.task.data?.device_renew && !api.task.data?.confirmReceipt
   }, [api.task])
   console.log("isRenewAndCollected: ", isRenewAndCollected)
   console.log("hasSparePartsAndCollected: ", hasSparePartsAndCollected)
   console.log("hasSparePartsButNotCollected: ", hasSparePartsButNotCollected)
   console.log("isRenewAndNotCollected: ", isRenewAndNotCollected)
   console.log(
      "Button class:",
      cn(
         (!scannedResult ||
            hasSparePartsAndCollected ||
            hasNoSpareParts ||
            isRenewAndCollected ||
            api.task.data?.status !== TaskStatus.ASSIGNED) &&
            "hidden",
      ),
   )

   const isNotRenew = useMemo(() => {
      return !api.task.data?.device_renew
   }, [api.task.data?.device_renew])

   const data = [
      ...(api.task.data?.device_renew
         ? [
              {
                 id: api.task.data.device_renew.id,
                 name: (
                    <>
                       {api.task.data.device_renew.deviceCode} <Tag color="green">Đề xuất</Tag>
                    </>
                 ),
                 manufacturer: api.task.data.device_renew.operationStatus,
              },
           ]
         : []),
      ...(api_machineModel[0].data?.devices || [])
         .filter((device) => device.positionX === null && device.positionY === null)
         .map((device) => ({
            id: device.id,
            name: device.deviceCode,
            manufacturer: device.operationStatus,
         })),
   ]
   console.log("taskStatus: ", api.task.data?.status)

   console.log("isNotRenew: ", isNotRenew)
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
            <DesktopScannerDrawer
               drawerProps={{
                  placement: "right",
                  width: "max-content",
               }}
               alertText="Vui lòng xác nhận mã QR của thiết bị mới"
               key="complete-renew"
               onScan={(res) => {
                  if (res !== api.task.data?.device_renew.id) {
                     message.error("Thiết bị không khớp")
                     return
                  }
                  setTimeout(() => {
                     // TODO fix
                     createSignatureDrawerRef.current?.handleOpen()
                  }, 500)
               }}
            >
               {(handleOpen1) => (
                  <PageContainer
                     title={`Xuất kho`}
                     extra={[
                        <Button key="back" onClick={() => handleOpen()} className={cn(!scannedResult && "hidden")}>
                           Quét lại
                        </Button>,
                        <Button
                           key="complete"
                           className={cn(
                              // !scannedResult ||
                              //    hasSparePartsAndCollected ||
                              //    hasNoSpareParts ||
                              //    isRenewAndCollected ||
                              //    (api.task.data?.status !== TaskStatus.ASSIGNED && "hidden"),
                              !scannedResult && "hidden",
                           )}
                           type="primary"
                           onClick={() => control_dualSignatureDrawer.current?.handleOpen({})}
                        >
                           Hoàn tất xuất kho
                        </Button>,

                        // <Button
                        //    key="complete-1"
                        //    className={cn(
                        //       (!scannedResult ||
                        //          isRenewAndCollected ||
                        //          isNotRenew ||
                        //          api.task.data?.status !== TaskStatus.ASSIGNED) &&
                        //          "hidden",
                        //    )}
                        //    type="primary"
                        //    onClick={() => handleOpen1()}
                        // >
                        //    Quét QR Thiết bị mới
                        // </Button>,
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
                                 {hasSparePartsButNotCollected && (
                                    <AlertCard
                                       text="Nhân viên chưa lấy linh kiện cho tác vụ này"
                                       className="mb-layout"
                                    />
                                 )}
                                 {isRenewAndNotCollected && (
                                    <AlertCard
                                       text="Nhân viên chưa lấy thiết bị mới cho tác vụ này"
                                       className="mb-layout"
                                    />
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
                                       {
                                          label: "Mẫu máy",
                                          children: api.task.data?.device.machineModel?.name ?? "-",
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
                        ...(api.spareParts.data && api.spareParts.data.length > 0
                           ? [
                                {
                                   tab: "Tất cả Linh kiện",
                                   key: "spare-part",
                                   children: (function SpareParts() {
                                      return (
                                         <Table
                                            expandable={{
                                               expandRowByClick: true,
                                               expandedRowRender: (record, index) => (
                                                  <Table
                                                     dataSource={record.issues}
                                                     pagination={false}
                                                     columns={[
                                                        {
                                                           title: "Tên lỗi",
                                                           render: (_, current) => current.typeError.name,
                                                        },
                                                        {
                                                           title: "Trạng thái",
                                                           render: (_, current) => {
                                                              if (failedIssues[current.id]) {
                                                                 return <Tag color="red">Thất bại</Tag>
                                                              } else {
                                                                 return (
                                                                    <Tag
                                                                       color={
                                                                          IssueStatusEnumTagMapper[current.status].color
                                                                       }
                                                                    >
                                                                       {IssueStatusEnumTagMapper[current.status].text}
                                                                    </Tag>
                                                                 )
                                                              }
                                                           },
                                                        },
                                                        {
                                                           title: "Số linh kiện cần",
                                                           render: (_, current) => {
                                                              return (
                                                                 current.issueSpareParts.find(
                                                                    (x: IssueSparePartDto) =>
                                                                       x.sparePart.id === record.sparePart.id,
                                                                 )?.quantity ?? 0
                                                              )
                                                           },
                                                        },
                                                        {
                                                           title: "Ghi chú",
                                                           width: 500,
                                                           render: (_, current) => {
                                                              if (failedIssues[current.id]) {
                                                                 return failedIssues[current.id].reason
                                                              } else return "-"
                                                           },
                                                        },
                                                        {
                                                           title: "",
                                                           fixed: "right",
                                                           width: 50,
                                                           render: (_, record) => (
                                                              <Dropdown
                                                                 key={"actions"}
                                                                 menu={{
                                                                    items: [
                                                                       ...(failedIssues[record.id]
                                                                          ? [
                                                                               {
                                                                                  key: "undo",
                                                                                  label: "Quay lại",
                                                                                  icon: <UndoOutlined />,
                                                                                  onClick: () =>
                                                                                     setFailedIssues((prev) => {
                                                                                        const {
                                                                                           [record.id]: _,
                                                                                           ...rest
                                                                                        } = prev
                                                                                        return rest
                                                                                     }),
                                                                               },
                                                                               {
                                                                                  key: "update",
                                                                                  label: "Cập nhật lý do",
                                                                                  icon: <EditOutlined />,
                                                                                  onClick: () => {
                                                                                     const reason =
                                                                                        failedIssues[record.id].reason
                                                                                     const defaultReason =
                                                                                        reason.split(":")[0]
                                                                                     const defaultDescription = reason
                                                                                        .split(":")[1]
                                                                                        ?.trim()
                                                                                     control_sparePartCannotExportModal.current?.handleOpen(
                                                                                        {
                                                                                           issueId: record.id,
                                                                                           defaultReason,
                                                                                           defaultDescription,
                                                                                        },
                                                                                     )
                                                                                  },
                                                                               },
                                                                            ]
                                                                          : [
                                                                               {
                                                                                  key: "cannot-fetch-spare-part",
                                                                                  label: "Không thể lấy linh kiện",
                                                                                  danger: true,
                                                                                  onClick: () =>
                                                                                     control_sparePartCannotExportModal.current?.handleOpen(
                                                                                        {
                                                                                           issueId: record.id,
                                                                                        },
                                                                                     ),
                                                                               },
                                                                            ]),
                                                                    ],
                                                                 }}
                                                              >
                                                                 <Button
                                                                    type={"primary"}
                                                                    icon={<MoreOutlined />}
                                                                 ></Button>
                                                              </Dropdown>
                                                           ),
                                                        },
                                                     ]}
                                                  />
                                               ),
                                               fixed: "left",
                                            }}
                                            dataSource={Object.values(lazy_spareParts)}
                                            loading={api.spareParts.isPending}
                                            pagination={false}
                                            columns={[
                                               Table.EXPAND_COLUMN,
                                               {
                                                  key: "index",
                                                  title: "STT",
                                                  render: (_, __, index) => index + 1,
                                                  width: 70,
                                               },
                                               {
                                                  key: "name",
                                                  title: "Tên linh kiện",
                                                  dataIndex: ["sparePart", "name"],
                                                  render: (_, record) => record?.sparePart?.name,
                                               },
                                               {
                                                  key: "quantity",
                                                  title: "Số lượng",
                                                  dataIndex: "quantity",
                                                  render: (quantity) => quantity,
                                               },
                                               {
                                                  key: "no_issues",
                                                  title: "Số lỗi",
                                                  render: (_, record) => record.issues.length,
                                                  width: 80,
                                               },
                                            ]}
                                         />
                                      )
                                   })(),
                                },
                             ]
                           : []),
                        ...(api.task.isSuccess && api.task.data.device_renew
                           ? [
                                {
                                   tab: "Thiết bị mới",
                                   key: "device-renew",
                                   children: (
                                      <>
                                         <Descriptions
                                            items={[
                                               {
                                                  label: "Tên thiết bị",
                                                  children: (
                                                     <div
                                                        onClick={() => {
                                                           api.task.data &&
                                                              window.navigator.clipboard.writeText(
                                                                 api.task.data.device_renew.id,
                                                              )
                                                        }}
                                                     >
                                                        {api.task.data.device_renew.machineModel.name}
                                                     </div>
                                                  ),
                                               },
                                               {
                                                  label: "Nhà sản xuất",
                                                  children: api.task.data.device_renew.machineModel.manufacturer,
                                               },
                                               {
                                                  label: "Số lượng mũi khâu",
                                                  children: api.task.data.device_renew.machineModel.needleType,
                                               },
                                               {
                                                  label: "Tốc độ mũi khâu (spm)",
                                                  children: api.task.data.device_renew.machineModel.speed,
                                               },
                                               {
                                                  label: "Công suất",
                                                  children: api.task.data.device_renew.machineModel.power,
                                               },
                                               {
                                                  label: "Độ rộng mũi kim",
                                                  children: api.task.data.device_renew.machineModel.stitch,
                                               },
                                               {
                                                  label: "Độ cao chân vịt",
                                                  children: api.task.data.device_renew.machineModel.presser,
                                               },
                                               {
                                                  label: "Cuốn suốt tự động",
                                                  children: api.task.data.device_renew.machineModel.lubrication,
                                               },
                                               {
                                                  label: "Điện áp",
                                                  children: api.task.data.device_renew.machineModel.voltage,
                                               },
                                               {
                                                  label: "Chất liệu vải may",
                                                  children: api.task.data.device_renew.machineModel.fabric,
                                               },
                                               {
                                                  label: "Kích thước",
                                                  children: api.task.data.device_renew.machineModel.size,
                                               },
                                               {
                                                  label: "Tính năng đặc biệt",
                                                  children: api.task.data.device_renew.machineModel.features,
                                               },
                                               {
                                                  label: "Mô tả",
                                                  children: api.task.data.device_renew.machineModel.description,
                                               },
                                            ]}
                                         />
                                         {api.task.data.type !== TaskType.INSTALL_REPLACEMENT && (
                                            <div className="mt-5">
                                               <h2 className="mb-2 text-lg font-semibold">Chọn thiết bị mới</h2>
                                               <ProTable
                                                  rowKey="id"
                                                  columns={[
                                                     {
                                                        //   title: "Chọn",
                                                        dataIndex: "id",
                                                        render: (id) => (
                                                           <Checkbox
                                                           //   checked={selectedDevices.includes(id)}
                                                           //   onChange={(e) => handleCheckboxChange(id, e.target.checked)}
                                                           />
                                                        ),
                                                     },
                                                     {
                                                        title: "Mã số thiết bị",
                                                        dataIndex: "name",
                                                     },
                                                     {
                                                        title: "Thông số kỹ thuật",
                                                        dataIndex: "manufacturer",
                                                        width: 100,
                                                     },
                                                  ]}
                                                  dataSource={data}
                                                  pagination={false}
                                                  search={false}
                                                  options={false}
                                               />
                                            </div>
                                         )}
                                      </>
                                   ),
                                },
                             ]
                           : []),
                     ]}
                  >
                     <OverlayControllerWithRef ref={control_dualSignatureDrawer}>
                        <DualSignatureDrawer
                           onSubmit={async (staff, stockkeeper) => {
                              if (!scannedResult || !api.task.isSuccess) return
                              const failed = Object.entries(failedIssues)
                              if (failed.length > 0) {
                                 await mutate_failIssues.mutateAsync({
                                    issues: failed.map((issue) => ({
                                       id: issue[0],
                                       reason: issue[1].reason,
                                    })),
                                    staffSignature: staff,
                                    stockkeeperSignature: stockkeeper,
                                 })
                              }

                              await mutate_confirmReceipt.mutateAsync(
                                 {
                                    id: api.task.data.id,
                                    payload: {
                                       stockkeeper_signature: stockkeeper,
                                       staff_signature: staff,
                                    },
                                 },
                                 {
                                    onSuccess: async () => {
                                       await api.task.refetch()
                                       setScannedResult(null)
                                       control_dualSignatureDrawer.current?.handleClose()
                                       setTimeout(() => {
                                          handleOpen()
                                       }, 300)
                                    },
                                 },
                              )
                           }}
                        />
                     </OverlayControllerWithRef>
                     <OverlayControllerWithRef ref={control_sparePartCannotExportModal}>
                        <SparePart_CannotExportModal
                           handleSubmit={(values, issueId) => {
                              setFailedIssues((prev) => ({
                                 ...prev,
                                 [issueId]: {
                                    reason: values.reason + (values.description ? `: ${values.description}` : ""),
                                 },
                              }))
                              control_sparePartCannotExportModal.current?.handleClose()
                           }}
                        />
                     </OverlayControllerWithRef>
                  </PageContainer>
               )}
            </DesktopScannerDrawer>
         )}
      </DesktopScannerDrawer>
   )
}

export default Page
