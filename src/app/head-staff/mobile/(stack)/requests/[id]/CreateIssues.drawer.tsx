import React, { ReactNode, useMemo, useState } from "react"
import useModalControls from "@/common/hooks/useModalControls"
import { App, Drawer, List, Select } from "antd"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { useMutation, useQuery } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import { TypeErrorDto } from "@/common/dto/TypeError.dto"
import CreateSingleIssueDrawer from "@/app/head-staff/mobile/(stack)/requests/[id]/CreateSingleIssue.drawer"
import HeadStaff_Issue_CreateMany from "@/app/head-staff/_api/issue/create-many.api"

export default function CreateIssuesDrawer({
   children,
}: {
   children: (handleOpen: (requestId: string) => void) => ReactNode
}) {
   const { message } = App.useApp()

   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (requestId: string) => {
         setRequestId(requestId)
      },
      onClose: () => {
         setRequestId(undefined)
         if (selectedIssues.length > 0) {
            message.info("Thông tin vấn đề đã được lưu lại").then()
         }
      },
   })

   const [requestId, setRequestId] = useState<string | undefined>()
   const [selectedIssues, setSelectedIssues] = useState<FixRequestIssueDto[]>([])
   const [selectedTypeError, setSelectedTypeError] = useState<undefined | TypeErrorDto>()

   const api_request = useQuery({
      queryKey: headstaff_qk.request.byId(requestId ?? ""),
      queryFn: () => HeadStaff_Request_OneById({ id: requestId ?? "" }),
      enabled: !!requestId,
   })

   const api_device = useQuery({
      queryKey: headstaff_qk.device.byId(api_request.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: api_request.data?.device.id ?? "" }),
      enabled: api_request.isSuccess,
   })

   const mutate_createIssues = useMutation({
      mutationFn: HeadStaff_Issue_CreateMany,
      onSuccess: () => {
         handleClose()
         message.success("Tạo lỗi thành công").then()
      },
      onError: (error) => {
         message.error("Tạo lỗi thất bại: " + error.message).then()
      },
      onMutate: () => {
         message
            .loading({
               content: "Đang tạo lỗi...",
               key: "createIssues",
            })
            .then()
      },
      onSettled: () => {
         message.destroy("createIssues")
      },
   })

   const availableTypeErrors = useMemo(() => {
      if (!api_request.isSuccess || !api_device.isSuccess) {
         return undefined
      }

      const addedErrors = new Set(selectedIssues.map((issue) => issue.typeError.id))

      return api_device.data.machineModel.typeErrors.filter((error) => !addedErrors.has(error.id))
   }, [api_device.data?.machineModel.typeErrors, api_device.isSuccess, api_request.isSuccess, selectedIssues])

   function handleSelectIssue(value: TypeErrorDto) {
      setSelectedTypeError(value)
   }

   function handleCreateSingleIssue(newIssue: FixRequestIssueDto) {
      setSelectedIssues([...selectedIssues, newIssue])
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} title="Tạo lỗi" placement="bottom" height="100%">
            <List
               dataSource={selectedIssues}
               renderItem={(issue) => (
                  <List.Item>
                     <List.Item.Meta title={issue.typeError.name} description={issue.description} />
                  </List.Item>
               )}
            />
            <CreateSingleIssueDrawer onFinish={handleCreateSingleIssue}>
               {(handleOpen) => (
                  <Select
                     options={availableTypeErrors?.map((error) => ({
                        label: error.name,
                        value: JSON.stringify(error),
                     }))}
                     className="w-full"
                     showSearch
                     variant="outlined"
                     size="large"
                     placeholder="+ Thêm lỗi mới"
                     value={selectedTypeError}
                     onChange={(value) => {
                        handleSelectIssue(value)
                        if (!api_device.isSuccess) return
                        handleOpen(value, api_device.data)
                     }}
                  />
               )}
            </CreateSingleIssueDrawer>
         </Drawer>
      </>
   )
}
