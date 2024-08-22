import HeadStaff_Issue_CreateMany from "@/app/head-staff/_api/issue/create-many.api"
import HeadStaff_Issue_Create from "@/app/head-staff/_api/issue/create.api"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import HeadStaff_Task_Create from "@/app/head-staff/_api/task/create.api"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { FixType } from "@/common/enum/fix-type.enum"
import useModalControls from "@/common/hooks/useModalControls"
import { ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/constants/Warranty"
import { useMutation } from "@tanstack/react-query"
import { App, Button, Drawer, Form, Input } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { forwardRef, useImperativeHandle, useState } from "react"

export type SendWarrantyDrawerRefType = {
   handleOpen: (
      requestId: string,
      data: {
         machineModelName: string
         areaName: string
         createdAt: string
      },
   ) => void
}

type Props = {}

type FieldType = {
   note: string
}

const SendWarrantyDrawer = forwardRef<SendWarrantyDrawerRefType, Props>(function Component(_, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (
         requestId: string,
         data: {
            machineModelName: string
            areaName: string
            createdAt: string
         },
      ) => {
         setRequestId(requestId)
         setData(data)
      },
      onClose: () => {
         setRequestId(undefined)
         setData(null)
      },
   })
   const { message } = App.useApp()
   const [form] = Form.useForm<FieldType>()
   const router = useRouter()

   const [requestId, setRequestId] = useState<string | undefined>(undefined)
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

   async function handleSubmit(values: FieldType) {
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
         },
      })

      await mutate_createTask.mutateAsync({
         name: `${dayjs(data.createdAt).add(7, "hours").format("DDMMYY")}_${data.areaName}_${data.machineModelName}_Bảo hành`,
         operator: 0,
         priority: false,
         issueIDs: [issueSend.id],
         request: requestId,
         totalTime: 60,
      })

      router.push(`/head-staff/mobile/requests/${requestId}/approved`)
   }

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <>
         <Drawer title="Gửi bảo hành" open={open} onClose={handleClose} placement="bottom" height="max-content">
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
                  <Button type="primary" htmlType="submit" className="mt-layout w-full" size="large">
                     Gửi
                  </Button>
               </Form.Item>
            </Form>
         </Drawer>
      </>
   )
})

export default SendWarrantyDrawer
