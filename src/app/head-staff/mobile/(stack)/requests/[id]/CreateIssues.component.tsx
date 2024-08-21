import { App, Button, Card, Dropdown, Empty, List, Select, Tag } from "antd"
import React, { useMemo, useState } from "react"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { TypeErrorDto } from "@/common/dto/TypeError.dto"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import HeadStaff_Issue_CreateMany from "@/app/head-staff/_api/issue/create-many.api"
import CreateSingleIssueDrawer from "@/app/head-staff/mobile/(stack)/requests/[id]/CreateSingleIssue.drawer"
import { DeleteOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons"
import RejectTaskDrawer from "@/app/head-staff/_components/RejectTask.drawer"
import { cn } from "@/common/util/cn.util"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"

type Props = {
   requestId: string
}

export default function CreateIssuesComponent({ requestId }: Props) {
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const [selectedIssues, setSelectedIssues] = useState<FixRequestIssueDto[]>([])
   const [selectedTypeError, setSelectedTypeError] = useState<undefined | TypeErrorDto>()
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

   const mutate_createIssues = useMutation({
      mutationFn: HeadStaff_Issue_CreateMany,
      onSuccess: () => {
         message.success("Tạo lỗi thành công").then()
      },
      onError: (error) => {
         message.success("Tạo lỗi thành công").then()
         // message.error("Tạo lỗi thất bại: " + error.message).then()
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

   async function handleSubmit() {
      if (!selectedIssues.length) {
         message.error("Chưa có lỗi nào được tạo").then()
         return
      }

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
               await queryClient.invalidateQueries({
                  queryKey: headstaff_qk.request.byId(requestId),
               })
            },
         },
      )

      await queryClient.invalidateQueries({
         queryKey: headstaff_qk.request.byId(requestId),
      })
   }

   function handleSelectIssue(value: TypeErrorDto) {
      setSelectedTypeError(value)
   }

   function handleCreateSingleIssue(newIssue: FixRequestIssueDto) {
      setSelectedIssues([...selectedIssues, newIssue])
      setSelectedTypeErrorControl(undefined)
   }

   function handleDeleteSingleIssue(issue: FixRequestIssueDto) {
      setSelectedIssues(selectedIssues.filter((i) => i !== issue))
   }

   return (
      <>
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
                     handleSelectIssue(value as any)
                     if (!api_device.isSuccess) return
                     handleOpen(JSON.parse(value as any) as TypeErrorDto, api_device.data)
                  }}
               />
            )}
         </CreateSingleIssueDrawer>
         <div className="mb-2">
            {selectedIssues.length === 0 ? (
               <Card size="small">
                  <Empty description={"Chưa có lỗi nào được tạo"} image={Empty.PRESENTED_IMAGE_SIMPLE} />
               </Card>
            ) : (
               <List
               className="mt-5"
                  bordered
                  dataSource={selectedIssues}
                  renderItem={(issue) => {
                     console.log(issue)
                     return (
                        <List.Item
                           className={cn("p-3")}
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

         <section className="std-layout-outer fixed bottom-0 left-0 flex w-full items-center justify-center gap-3 bg-[#eef3f6] p-layout shadow-fb">
            <Button type="primary" size="large" icon={<PlusOutlined />} className="flex-grow" onClick={handleSubmit}>
               Ghi nhận lỗi
            </Button>
            <RejectTaskDrawer>
               {(handleOpen) => (
                  <Dropdown
                     menu={{
                        items: [
                           {
                              label: "Không xử lý yêu cầu",
                              danger: true,
                              key: "1",
                              onClick: () => handleOpen(requestId),
                           },
                           {
                              label: "Yêu cầu không có vấn đề?",
                              key: "2",
                              onClick: () => handleOpen(requestId),
                           },
                        ],
                     }}
                  >
                     <Button icon={<MoreOutlined />} size="large"></Button>
                  </Dropdown>
               )}
            </RejectTaskDrawer>
         </section>
      </>
   )
}
