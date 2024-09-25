import HeadStaff_Device_OneById from "@/features/head-maintenance/api/device/one-byId.api"
import HeadStaff_Issue_Create from "@/features/head-maintenance/api/issue/create.api"
import headstaff_qk from "@/features/head-maintenance/qk"
import HeadStaff_Request_OneById from "@/features/head-maintenance/api/request/oneById.api"
import HeadStaff_Request_UpdateStatus from "@/features/head-maintenance/api/request/updateStatus.api"
import HeadStaff_Task_Create from "@/features/head-maintenance/api/task/create.api"
import DataListView from "@/components/DataListView"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { FixType } from "@/lib/domain/Issue/FixType.enum"
import useModalControls from "@/lib/hooks/useModalControls"
import { ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import { Info } from "@phosphor-icons/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Button, Card, Drawer, Form, Input } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react"
import HeadStaff_Task_Update from "@/features/head-maintenance/api/task/update.api"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"

export type SendWarrantyDrawerRefType = {
   handleOpen: (
      requestId: string,
      device: DeviceDto,
      data: {
         machineModelName: string
         areaName: string
         createdAt: string
      },
   ) => void
}

type Props = {
   params: { id: string }
}

type FieldType = {
   note: string
}

const SendWarrantyDrawer = forwardRef<SendWarrantyDrawerRefType, Props>(function Component({ params }, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (
         requestId: string,
         device: DeviceDto,
         data: {
            machineModelName: string
            areaName: string
            createdAt: string
         },
      ) => {
         setRequestId(requestId)
         setDevice(device)
         setData(data)
      },
      onClose: () => {
         setRequestId(undefined)
         setDevice(null)
         setData(null)
      },
   })
   const router = useRouter()
   const { message } = App.useApp()

   const [requestId, setRequestId] = useState<string | undefined>(undefined)
   const [device, setDevice] = useState<DeviceDto | null>(null)
   const [data, setData] = useState<{
      machineModelName: string
      areaName: string
      createdAt: string
   } | null>(null)

   const mutate_createIssues = useMutation({
      mutationFn: HeadStaff_Issue_Create,
   })

   const mutate_updateRequest = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
   })

   const mutate_createTask = useMutation({
      mutationFn: HeadStaff_Task_Create,
   })

   const mutate_updateTaskStatus = useMutation({
      mutationFn: HeadStaff_Task_Update,
   })

   async function handleSubmit(values: FieldType) {
      try {
         message.destroy("loading")
         message.loading({
            content: "Vui lòng chờ...",
            key: "loading",
         })
         if (!requestId || !data) return
         const issueSend = await mutate_createIssues.mutateAsync({
            description: values.note,
            typeError: SendWarrantyTypeErrorId,
            fixType: FixType.REPAIR,
            request: requestId,
         })

         const issueReceive = await mutate_createIssues.mutateAsync({
            description: "Nhận và lắp đặt thiết bị đã bảo hành",
            typeError: ReceiveWarrantyTypeErrorId,
            fixType: FixType.REPAIR,
            request: requestId,
         })

         const request = await mutate_updateRequest.mutateAsync({
            id: requestId,
            payload: {
               status: FixRequestStatus.APPROVED,
               is_warranty: true,
            },
         })

         const task = await mutate_createTask.mutateAsync({
            name: `${dayjs(data.createdAt).add(7, "hours").format("DDMMYY")}_${data.areaName}_${data.machineModelName}_Bảo hành`,
            operator: 0,
            priority: false,
            issueIDs: [issueSend.id],
            request: requestId,
            totalTime: 60,
         })

         const updateTask = await mutate_updateTaskStatus.mutateAsync({
            id: task.id,
            payload: {
               status: TaskStatus.AWAITING_FIXER,
            },
         })

         message.destroy("loading")
         message.success({
            content: "Cập nhật thành công",
         })
         router.push(`/head-staff/mobile/requests?status=${FixRequestStatus.APPROVED}`)
      } catch (e) {
         message.error({
            content: "Có lỗi xảy ra",
         })
      }
   }

   const isLoading = useMemo(() => {
      return mutate_createIssues.isPending || mutate_updateRequest.isPending || mutate_createTask.isPending
   }, [mutate_createIssues.isPending, mutate_createTask.isPending, mutate_updateRequest.isPending])

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   const api = useQuery({
      queryKey: headstaff_qk.request.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
   })

   const deviceWarranty = useQuery({
      queryKey: headstaff_qk.device.byId(api.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: api.data?.device.id ?? "" }),
      enabled: api.isSuccess,
   })

   const isTwoWeeks = useMemo(() => {
      if (deviceWarranty.isSuccess && deviceWarranty.data) {
         const { machineModel } = deviceWarranty.data
         const warrantyTerm = machineModel.warrantyTerm

         if (warrantyTerm) {
            const warrantyEndDate = dayjs(warrantyTerm)
            const currentDate = dayjs()
            const twoWeeksFromNow = currentDate.add(2, "week")

            if (warrantyEndDate.isBefore(twoWeeksFromNow)) {
               return true
            }
         }
      }
      return false
   }, [deviceWarranty.data, deviceWarranty.isSuccess])

   return (
      <>
         <Drawer title="Gửi bảo hành" open={open} onClose={handleClose} placement="bottom" height="max-content">
            {isTwoWeeks && (
               <section className="mb-layout">
                  <Card size="small" className="border-2 border-yellow-200 bg-yellow-100">
                     <div className="mb-2 flex items-center gap-1 font-bold text-yellow-600">
                        <Info weight="fill" size={20} />
                        Lưu ý
                     </div>
                     <div className="text-yellow-600">Thiết bị này sẽ hết bảo hành trong dưới 2 tuần.</div>
                  </Card>
               </section>
            )}
            <section className="mb-layout">
               <h3 className="text-lg font-semibold leading-8 text-neutral-700">THÔNG TIN BẢO HÀNH</h3>

               <div className="rounded-lg border-2 border-neutral-200">
                  <DataListView
                     bordered
                     dataSource={device}
                     itemClassName="py-2"
                     labelClassName="font-normal text-neutral-400 text-[14px]"
                     valueClassName="text-[14px] font-medium"
                     items={[
                        {
                           label: "Mẫu máy",
                           value: (s) => s.machineModel?.name,
                        },
                        {
                           label: "Nhà sản xuất",
                           value: (s) => s.machineModel?.manufacturer,
                        },
                        {
                           label: "Năm sản xuất",
                           value: (s) => s.machineModel?.yearOfProduction,
                        },
                     ]}
                  />
               </div>
            </section>
            <Form<FieldType> onFinish={handleSubmit}>
               <Form.Item<FieldType> name="note" label="Thông tin đính kèm" rules={[{ required: true }]}>
                  <Input.TextArea
                     placeholder="Nhập thông tin đính kèm cho bên bảo hành thiết bị"
                     maxLength={300}
                     showCount
                     allowClear
                  />
               </Form.Item>
               <Form.Item noStyle>
                  <Button
                     type="primary"
                     htmlType="submit"
                     className="mt-layout w-full"
                     size="large"
                     loading={isLoading}
                  >
                     Gửi
                  </Button>
               </Form.Item>
            </Form>
         </Drawer>
      </>
   )
})

export default SendWarrantyDrawer
