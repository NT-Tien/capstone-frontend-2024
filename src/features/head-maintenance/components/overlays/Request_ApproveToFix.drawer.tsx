"use client"

import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import AlertCard from "@/components/AlertCard"
import { DeleteOutlined, EditOutlined, SendOutlined } from "@ant-design/icons"
import { Info } from "@phosphor-icons/react"
import Button from "antd/es/button"
import Card from "antd/es/card"
import Drawer from "antd/es/drawer"
import Empty from "antd/es/empty"
import List from "antd/es/list"
import Select from "antd/es/select"
import Tag from "antd/es/tag"
import { DrawerProps } from "antd/es"
import { useMemo, useRef, useState } from "react"
import Issue_CreateDetailsDrawer, { CreateSingleIssueDrawerRefType } from "./Issue_CreateDetails.drawer"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import MachineModelUtil from "@/lib/domain/MachineModel/MachineModel.util"
import { useRouter } from "next/navigation"
import { App } from "antd"

type Request_ApproveToFixDrawerProps = {
   requestId?: string
   refetchFn?: () => void
}
type Props = Omit<DrawerProps, "children"> & Request_ApproveToFixDrawerProps

function Request_ApproveToFixDrawer(props: Props) {
   const router = useRouter()
   const { modal } = App.useApp()

   const [selectedIssues, setSelectedIssues] = useState<IssueDto[]>([])
   const [selectedTypeErrorControl, setSelectedTypeErrorControl] = useState<undefined | string>()

   const control_createSingleIssueDrawer = useRef<CreateSingleIssueDrawerRefType | null>(null)

   const api_request = head_maintenance_queries.request.one(
      {
         id: props.requestId ?? "",
      },
      {
         enabled: !!props.requestId,
      },
   )
   const api_device = head_maintenance_queries.device.one(
      {
         id: api_request.data?.device.id ?? "",
      },
      {
         enabled: api_request.isSuccess,
      },
   )
   const api_commonIssues = head_maintenance_queries.typeError.common({})

   const mutate_requestApproveToFix = head_maintenance_mutations.request.approveToFix()

   const selectableTypeErrors = useMemo(() => {
      if (!api_request.isSuccess || !api_device.isSuccess || !api_commonIssues.isSuccess) {
         return undefined
      }

      const commonTypeErrors = api_commonIssues.data
      const machineTypeErrors = api_device.data.machineModel.typeErrors
      const addedErrors = new Set(selectedIssues.map((issue) => issue.typeError.id))

      return [...commonTypeErrors, ...machineTypeErrors].filter((error) => !addedErrors.has(error.id))
   }, [
      api_commonIssues.data,
      api_commonIssues.isSuccess,
      api_device.data?.machineModel.typeErrors,
      api_device.isSuccess,
      api_request.isSuccess,
      selectedIssues,
   ])

   async function handleSubmit(submitData: { hasWarranty: boolean; requestId: string; selectedIssues: IssueDto[] }) {
      modal.confirm({
         title: "Lưu ý",
         content: submitData.hasWarranty
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
         onOk: () => {
            mutate_requestApproveToFix.mutate(
               {
                  id: submitData.requestId,
                  payload: {
                     issues: submitData.selectedIssues.map((issue) => ({
                        fixType: issue.fixType,
                        description: issue.description,
                        typeError: issue.typeError.id,
                        spareParts: issue.issueSpareParts.map((sp) => ({
                           sparePart: sp.sparePart.id,
                           quantity: sp.quantity,
                        })),
                     })),
                  },
               },
               {
                  onSuccess: async () => {
                     router.push(`/head-staff/mobile/requests?status=${FixRequestStatus.APPROVED}`)
                  },
               },
            )
         },
      })
   }

   function handleCreateOrUpdateSingleIssue(newIssue: IssueDto) {
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

   function handleDeleteSingleIssue(issue: IssueDto) {
      setSelectedIssues(selectedIssues.filter((i) => i !== issue))
   }

   return (
      <Drawer
         title="Xác nhận yêu cầu"
         placement="right"
         height="100%"
         width="100%"
         footer={
            <Button
               size={"large"}
               className="w-full"
               type="primary"
               icon={<SendOutlined />}
               disabled={selectedIssues.length === 0}
               loading={mutate_requestApproveToFix.isPending}
               onClick={() =>
                  props.requestId &&
                  handleSubmit({
                     requestId: props.requestId,
                     hasWarranty: MachineModelUtil.canBeWarranted(api_device.data?.machineModel),
                     selectedIssues,
                  })
               }
            >
               Gửi
            </Button>
         }
         classNames={{
            footer: "p-layout",
         }}
         {...props}
      >
         <AlertCard
            text="Vui lòng chọn các lỗi thiết bị hiện có từ danh sách bên dưới"
            type="info"
            icon={<Info size={20} weight="fill" />}
            className="mb-layout"
         />
         <Select
            options={selectableTypeErrors?.map((error) => ({
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
               control_createSingleIssueDrawer.current?.handleOpen({
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
                                    control_createSingleIssueDrawer.current?.handleOpen({
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
         <Issue_CreateDetailsDrawer onFinish={handleCreateOrUpdateSingleIssue} ref={control_createSingleIssueDrawer} />
      </Drawer>
   )
}

export default Request_ApproveToFixDrawer
export type { Request_ApproveToFixDrawerProps }
