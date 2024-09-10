import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import HeadStaff_Issue_CreateMany from "@/app/head-staff/_api/issue/create-many.api"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { TypeErrorDto } from "@/common/dto/TypeError.dto"
import { FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import useModalControls from "@/common/hooks/useModalControls"
import { DeleteOutlined, SendOutlined } from "@ant-design/icons"
import { Info } from "@phosphor-icons/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import App from "antd/es/app"
import Button from "antd/es/button"
import Card from "antd/es/card"
import Drawer from "antd/es/drawer"
import Empty from "antd/es/empty"
import List from "antd/es/list"
import Select from "antd/es/select"
import Tag from "antd/es/tag"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { forwardRef, ReactNode, useImperativeHandle, useMemo, useState } from "react"
import CreateSingleIssueDrawer from "./CreateSingleIssue.drawer"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import HeadStaff_TypeError_Common from "@/app/head-staff/_api/typeError/common.api"

export type ApproveRequestDrawerRefType = {
   handleOpen: (requestId: string) => void
}

type Props = {
   children?: (handleOpen: (requestId: string) => void) => ReactNode
   refetchFn?: () => void
}

const ApproveRequestDrawer = forwardRef<ApproveRequestDrawerRefType, Props>(function Component(
   { children, ...props },
   ref,
) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (requestId: string) => {
         setRequestId(requestId)
      },
      onClose: () => {
         setRequestId(undefined)
      },
   })
   const { message, modal } = App.useApp()
   const router = useRouter()

   const [requestId, setRequestId] = useState<string | undefined>(undefined)
   const [selectedIssues, setSelectedIssues] = useState<FixRequestIssueDto[]>([])
   const [selectedTypeErrorControl, setSelectedTypeErrorControl] = useState<undefined | string>()

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
   const api_commonIssues = useQuery({
      queryKey: headstaff_qk.typeError.common(),
      queryFn: () => HeadStaff_TypeError_Common(),
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

   const availableTypeErrors = useMemo(() => {
      if (!api_request.isSuccess || !api_device.isSuccess || !api_commonIssues.isSuccess) {
         return undefined
      }

      const addedErrors = new Set(selectedIssues.map((issue) => issue.typeError.id))
      const allErrors = [...api_device.data.machineModel.typeErrors, ...api_commonIssues.data]
      return allErrors.filter((error) => !addedErrors.has(error.id))
   }, [
      api_commonIssues.data,
      api_commonIssues.isSuccess,
      api_device.data?.machineModel.typeErrors,
      api_device.isSuccess,
      api_request.isSuccess,
      selectedIssues,
   ])

   async function handleSubmit() {
      if (!selectedIssues.length) {
         message.error("Chưa có lỗi nào được tạo").then()
         return
      }

      if (!requestId) return

      modal.confirm({
         onOk: () => {
            mutate_createIssues.mutate(
               {
                  request: requestId,
                  issues: selectedIssues.map((issue) => ({
                     fixType: issue.fixType,
                     description: issue.description,
                     typeError: issue.typeError.id,
                     spareParts: issue.issueSpareParts.map((sp) => ({
                        sparePart: sp.sparePart.id,
                        quantity: sp.quantity,
                     })),
                  })),
               },
               {
                  onSuccess: async () => {
                     props.refetchFn?.()
                     handleClose()
                     router.push(`/head-staff/mobile/requests?status=${FixRequestStatus.APPROVED}`)
                  },
               },
            )
         },
         title: "Lưu ý",
         content: (
            <span>
               <strong>
                  {dayjs().isBefore(dayjs(api_request.data?.device.machineModel.warrantyTerm)) &&
                     "Thiết bị này vẫn còn trong thời gian bảo hành. "}
               </strong>
               Bạn có chắc chắn muốn xác nhận yêu cầu này?
            </span>
         ),
         okText: "Đồng ý",
         cancelText: "Hủy",
         cancelButtonProps: {
            type: "default",
         },
         okButtonProps: {
            type: "primary",
         },
      })
   }

   function handleCreateSingleIssue(newIssue: FixRequestIssueDto) {
      setSelectedIssues([...selectedIssues, newIssue])
      setSelectedTypeErrorControl(undefined)
   }

   function handleDeleteSingleIssue(issue: FixRequestIssueDto) {
      setSelectedIssues(selectedIssues.filter((i) => i !== issue))
   }

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <>
         {children?.(handleOpen)}
         <Drawer open={open} onClose={handleClose} title="Xác nhận yêu cầu" placement="bottom" height="100%">
            <section className="mb-layout">
               <Card
                  size="small"
                  classNames={{
                     body: "flex p-3",
                  }}
               >
                  <Info size={20} className="mr-3" />
                  <div>Vui lòng chọn các lỗi xuất hiện trên thiết bị.</div>
               </Card>
            </section>
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
                     value={selectedTypeErrorControl}
                     onChange={(value) => {
                        setSelectedTypeErrorControl(value)
                        if (!api_device.isSuccess) return
                        handleOpen(JSON.parse(value as any) as TypeErrorDto, api_device.data)
                     }}
                  />
               )}
            </CreateSingleIssueDrawer>
            <div className="mt-2">
               {selectedIssues.length === 0 ? (
                  <Card size="small">
                     <Empty description={"Chưa có lỗi nào được tạo"} image={Empty.PRESENTED_IMAGE_DEFAULT} />
                  </Card>
               ) : (
                  <List
                     bordered
                     dataSource={selectedIssues}
                     renderItem={(issue) => {
                        console.log(issue)
                        return (
                           <List.Item
                              className="p-3"
                              actions={[
                                 <Button
                                    key="delete"
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteSingleIssue(issue)}
                                 />,
                              ]}
                           >
                              <List.Item.Meta
                                 title={issue.typeError.name}
                                 description={
                                    <div className="space-x-2">
                                       <Tag color={FixTypeTagMapper[issue.fixType].colorInverse}>
                                          {FixTypeTagMapper[issue.fixType].text}
                                       </Tag>
                                       {issue.description}
                                    </div>
                                 }
                              />
                           </List.Item>
                        )
                     }}
                  />
               )}
            </div>
            <section className="fixed bottom-0 left-0 flex w-full justify-center gap-3 bg-inherit p-layout">
               <Button
                  size={"large"}
                  className="w-full"
                  type="primary"
                  icon={<SendOutlined />}
                  disabled={selectedIssues.length === 0}
                  loading={mutate_createIssues.isPending}
                  onClick={handleSubmit}
               >
                  Gửi
               </Button>
            </section>
         </Drawer>
      </>
   )
})

export default ApproveRequestDrawer
