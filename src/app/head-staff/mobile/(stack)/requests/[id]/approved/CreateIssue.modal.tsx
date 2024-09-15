import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_TypeError_Common from "@/app/head-staff/_api/typeError/common.api"
import useModalControls from "@/common/hooks/useModalControls"
import AlertCard from "@/components/AlertCard"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Button, Drawer, Form, Modal, Select } from "antd"
import { forwardRef, ReactNode, useImperativeHandle, useMemo, useRef, useState } from "react"
import CreateSingleIssueDrawer, { CreateSingleIssueDrawerRefType } from "../CreateSingleIssue.drawer"
import { TypeErrorDto } from "@/common/dto/TypeError.dto"
import HeadStaff_Issue_Create from "@/app/head-staff/_api/issue/create.api"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import HeadStaff_Issue_CreateMany from "@/app/head-staff/_api/issue/create-many.api"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"
import { ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/constants/Warranty"

type HandleOpen = {
   deviceId: string
   request: FixRequestDto
}

export type CreateIssueModalRefType = {
   handleOpen: (props: HandleOpen) => void
}

type Props = {
   children?: (handleOpen: (props: HandleOpen) => void) => ReactNode
   onFinish?: () => void
}

const CreateIssueModal = forwardRef<CreateIssueModalRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (props: HandleOpen) => {
         setDeviceId(props.deviceId)
         setRequest(props.request)
      },
      onClose: () => {
         setDeviceId(null)
         setSelectedTypeErrorControl(null)
         setRequest(null)
      },
   })
   const { message } = App.useApp()

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   const createSingleIssueDrawerRef = useRef<CreateSingleIssueDrawerRefType | null>(null)

   const [deviceId, setDeviceId] = useState<string | null>(null)
   const [request, setRequest] = useState<FixRequestDto | null>(null)
   const [selectedTypeErrorControl, setSelectedTypeErrorControl] = useState<string | null>(null)

   const api_device = useQuery({
      queryKey: headstaff_qk.device.byId(deviceId ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: deviceId ?? "" }),
      enabled: !!deviceId,
   })

   const api_commonTypeErrors = useQuery({
      queryKey: headstaff_qk.typeError.common(),
      queryFn: () => HeadStaff_TypeError_Common(),
      enabled: !!deviceId,
   })

   const mutate_createIssues = useMutation({
      mutationFn: HeadStaff_Issue_CreateMany,
      onMutate: async () => {
         message.destroy("createIssues")
         message.loading({
            type: "loading",
            content: "Vui lòng chờ...",
            key: "createIssues",
         })
      },
      onSuccess: async () => {
         message.success("Xác nhận yêu cầu thành công")
      },
      onError: async (error) => {
         message.error("Xác nhận yêu cầu thất bại: " + error.message)
      },
      onSettled: async () => {
         message.destroy("createIssues")
      },
   })

   const selectOptions = useMemo(() => {
      if (!api_device.isSuccess || !api_commonTypeErrors.isSuccess || !request) return []

      const allOptions = [...api_device.data.machineModel.typeErrors, ...api_commonTypeErrors.data]
      const existingOptions: Set<string> = new Set<string>([SendWarrantyTypeErrorId, ReceiveWarrantyTypeErrorId])

      // cannot create two issues with the same typeError if issue is pending
      request.issues.forEach((issue) => {
         if (issue.status === IssueStatusEnum.PENDING) {
            existingOptions.add(issue.typeError.id)
         }
      })

      return allOptions
         .filter((te) => !existingOptions.has(te.id))
         .map((te) => ({
            label: te.name,
            value: JSON.stringify(te),
         }))
   }, [api_commonTypeErrors.data, api_commonTypeErrors.isSuccess, api_device.data?.machineModel.typeErrors, api_device.isSuccess, request])

   function handleFinish(issue: FixRequestIssueDto) {
      if (!request) return
      mutate_createIssues.mutate(
         {
            request: request.id,
            issues: [
               {
                  description: issue.description,
                  fixType: issue.fixType,
                  typeError: issue.typeError.id,
                  spareParts: issue.issueSpareParts.map((sp) => ({
                     sparePart: sp.sparePart.id,
                     quantity: sp.quantity,
                  })),
               },
            ],
         },
         {
            onSuccess: () => {
               handleClose()
               props.onFinish?.()
            },
         },
      )
   }

   return (
      <>
         {props.children?.(handleOpen)}
         <Modal open={open} onCancel={handleClose} title="Tạo lỗi" centered>
            {api_device.isSuccess && api_commonTypeErrors.isSuccess && (
               <div>
                  <AlertCard type="info" text="Vui lòng chọn loại lỗi phía dưới" className="mb-layout" />
                  <Select
                     className="w-full"
                     allowClear
                     showSearch
                     variant="outlined"
                     options={selectOptions}
                     placeholder="Chọn loại lỗi"
                     size="large"
                     value={selectedTypeErrorControl}
                     onChange={(value) => {
                        setSelectedTypeErrorControl(value)
                        if (!api_device.isSuccess) return
                        createSingleIssueDrawerRef.current?.handleOpen({
                           device: api_device.data,
                           typeError: JSON.parse(value as any) as TypeErrorDto,
                        })
                     }}
                  />
               </div>
            )}
         </Modal>
         <CreateSingleIssueDrawer onFinish={handleFinish} ref={createSingleIssueDrawerRef} />
      </>
   )
})

export default CreateIssueModal
