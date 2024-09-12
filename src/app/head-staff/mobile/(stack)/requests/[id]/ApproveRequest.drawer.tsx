import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import HeadStaff_Issue_CreateMany from "@/app/head-staff/_api/issue/create-many.api"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_TypeError_Common from "@/app/head-staff/_api/typeError/common.api"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { TypeErrorDto } from "@/common/dto/TypeError.dto"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import useModalControls from "@/common/hooks/useModalControls"
import AlertCard from "@/components/AlertCard"
import { DeleteOutlined, SendOutlined, EditOutlined } from "@ant-design/icons"
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
import { DrawerProps } from "antd/lib"
import { useRouter } from "next/navigation"
import { forwardRef, ReactNode, useImperativeHandle, useMemo, useRef, useState } from "react"
import CreateSingleIssueDrawer, { CreateSingleIssueDrawerRefType } from "./CreateSingleIssue.drawer"
import dayjs from "dayjs"

export type ApproveRequestDrawerRefType = {
   handleOpen: (requestId: string) => void
}

type Props = {
   drawerProps?: Omit<DrawerProps, "children">
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

   const createSingleIssueDrawerRef = useRef<CreateSingleIssueDrawerRefType | null>(null)

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
      if (!api_device.isSuccess) return

      if (!selectedIssues.length) {
         message.error("Chưa có lỗi nào được tạo").then()
         return
      }

      if (!requestId) return

      const warrantyTerm = dayjs(api_device.data.machineModel.warrantyTerm)
      const hasWarranty = (warrantyTerm.isValid() && warrantyTerm.isAfter(dayjs())) ?? false

      modal.confirm({
         onOk: () => ok(requestId),
         title: "Lưu ý",
         content: hasWarranty
            ? "Thiết bị này vẫn còn trong thời gian bảo hành. Bạn có chắc chắn muốn xác nhận yêu cầu này?"
            : "Bạn có chắc chắn muốn xác nhận yêu cầu này?",
         okText: "Tiếp tục",
         cancelText: "Đóng",
         cancelButtonProps: {
            type: "default",
         },
         centered: true,
         okButtonProps: {
            type: "primary",
         },
         closable: true,
      })
   }

   function ok(requestId: string) {
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
               router.push(`/head-staff/mobile/requests?status=${FixRequestStatus.APPROVED}`)
               // props.refetchFn?.()
            },
         },
      )
   }

   function handleCreateOrUpdateSingleIssue(newIssue: FixRequestIssueDto) {
      const index = selectedIssues.findIndex((i) => i.typeError.id === newIssue.typeError.id)
      if (index !== -1) {
         // update
         const newSelectedIssues = [...selectedIssues]
         newSelectedIssues[index] = newIssue
         setSelectedIssues(newSelectedIssues)
      } else {
         // create
         setSelectedIssues([...selectedIssues, newIssue])
      }
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
         <Drawer
            open={open}
            onClose={handleClose}
            title="Xác nhận yêu cầu"
            placement="right"
            height="100%"
            width="100%"
            {...props.drawerProps}
         >
            <AlertCard
               text="Vui lòng chọn các lỗi thiết bị hiện có từ danh sách bên dưới"
               type="info"
               icon={<Info size={20} weight="fill" />}
               className="mb-layout"
            />
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
                  createSingleIssueDrawerRef.current?.handleOpen({
                     device: api_device.data,
                     typeError: JSON.parse(value as any) as TypeErrorDto,
                  })
               }}
            />
            <div className="mt-4">
               {selectedIssues.length === 0 ? (
                  <Card size="small">
                     <Empty description={"Chưa có lỗi nào được tạo"} image={Empty.PRESENTED_IMAGE_DEFAULT} />
                  </Card>
               ) : (
                  <List
                     bordered
                     dataSource={selectedIssues}
                     renderItem={(issue) => {
                        return (
                           <List.Item
                              className="p-3"
                              actions={[
                                 <Button
                                    key="edit"
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                       if (!api_device.data) return
                                       createSingleIssueDrawerRef.current?.handleOpen({
                                          device: api_device.data,
                                          typeError: issue.typeError,
                                          defaultIssue: issue,
                                       })
                                    }}
                                 ></Button>,
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
                                    <div className="flex items-center gap-2 text-sm">
                                       <Tag color={FixTypeTagMapper[issue.fixType].colorInverse}>
                                          {FixTypeTagMapper[issue.fixType].text}
                                       </Tag>
                                       <div className="truncate">{issue.description}</div>
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
            <CreateSingleIssueDrawer onFinish={handleCreateOrUpdateSingleIssue} ref={createSingleIssueDrawerRef} />
         </Drawer>
      </>
   )
})

export default ApproveRequestDrawer
