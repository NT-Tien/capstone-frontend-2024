"use client"

import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import AlertCard from "@/components/AlertCard"
import { CloseOutlined, DeleteOutlined, EditOutlined, MoreOutlined, SendOutlined } from "@ant-design/icons"
import { Info, Wrench } from "@phosphor-icons/react"
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
import { App, ConfigProvider, Divider, Space } from "antd"
import { cn } from "@/lib/utils/cn.util"
import IssueSparePartUtil from "@/lib/domain/IssueSparePart/IssueSparePart.util"
import IssueUtil from "@/lib/domain/Issue/Issue.util"

type Request_ApproveToFixDrawerProps = {
   requestId?: string
   isMultiple?: boolean
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> & Request_ApproveToFixDrawerProps

function Request_ApproveToFixDrawer(props: Props) {
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
                     isMultiple: props.isMultiple,
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
                  onSuccess: props.onSuccess,
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
      <>
         <Drawer
            title={
               <div className={"flex w-full items-center justify-between"}>
                  <Button className={"text-white"} icon={<CloseOutlined />} type={"text"} onClick={props.onClose} />
                  <h1 className={"text-lg font-semibold"}>Xác nhận sửa chữa</h1>
                  <Button className={"text-white"} icon={<MoreOutlined />} type={"text"} />
               </div>
            }
            closeIcon={false}
            placement="bottom"
            height="90%"
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
                        hasWarranty: MachineModelUtil.canBeWarranted(api_device.data?.machineModel) ?? false,
                        selectedIssues,
                     })
                  }
               >
                  Gửi
               </Button>
            }
            classNames={{
               footer: "p-layout",
               header: "bg-head_maintenance text-white *:text-white",
            }}
            {...props}
         >
            {selectedIssues.length === 0 && (
               <AlertCard
                  text="Vui lòng chọn các lỗi thiết bị hiện có từ danh sách bên dưới"
                  type="info"
                  icon={<Info size={20} weight="fill" />}
                  className="mb-layout"
               />
            )}
            <Select
               options={selectableTypeErrors?.map((error) => ({
                  label: error.name,
                  value: JSON.stringify(error),
               }))}
               className="select-white-placeholder w-full rounded-lg bg-head_maintenance text-white *:text-white"
               autoClearSearchValue
               showSearch
               variant="borderless"
               size="large"
               placeholder="+ Thêm lỗi mới"
               loading={api_commonIssues.isPending}
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
            <div className="mt-2">
               {selectedIssues.length === 0 ? (
                  <Card size="small">
                     <Empty description={"Chưa có lỗi nào được tạo"} image={Empty.PRESENTED_IMAGE_DEFAULT} />
                  </Card>
               ) : (
                  <List
                     bordered
                     dataSource={selectedIssues}
                     itemLayout={"horizontal"}
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
                                    <Space
                                       wrap
                                       split={<Divider className={"m-0"} type={"vertical"} />}
                                       className="flex items-center gap-2 text-sm"
                                    >
                                       <div className={FixTypeTagMapper[issue.fixType].className}>
                                          {FixTypeTagMapper[issue.fixType].text}
                                       </div>
                                       {issue.issueSpareParts.length > 0 && (
                                          <div
                                             className={cn(
                                                "flex items-center gap-1",
                                                IssueUtil.hasOutOfStockIssueSpareParts(issue) && "text-yellow-500",
                                             )}
                                          >
                                             <Wrench size={16} weight={"duotone"} />
                                             {issue.issueSpareParts.length} linh kiện
                                          </div>
                                       )}
                                    </Space>
                                 }
                              >
                                 Test
                              </List.Item.Meta>
                           </List.Item>
                        )
                     }}
                  />
               )}
            </div>
         </Drawer>
         <Issue_CreateDetailsDrawer onFinish={handleCreateOrUpdateSingleIssue} ref={control_createSingleIssueDrawer} />
      </>
   )
}

export default Request_ApproveToFixDrawer
export type { Request_ApproveToFixDrawerProps }
