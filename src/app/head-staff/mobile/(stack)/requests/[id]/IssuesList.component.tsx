import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { useMutation, UseQueryResult } from "@tanstack/react-query"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { DeviceDto } from "@/common/dto/Device.dto"
import React, { forwardRef, ReactNode, useImperativeHandle, useMemo, useRef, useState } from "react"
import { App, Badge, Button, Card, Drawer, Empty, Form, Radio, Select, Skeleton, Tag } from "antd"
import { BaseSelectRef } from "rc-select"
import HeadStaff_Issue_Create from "@/app/head-staff/_api/issue/create.api"
import IssueDetailsDrawer, { IssueDetailsDrawerRefType } from "@/app/head-staff/_components/IssueDetailsDrawer"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { ProDescriptions, ProFormTextArea } from "@ant-design/pro-components"
import RequestDetails from "@/app/head-staff/mobile/(stack)/requests/[id]/page"
import { ArrowRightOutlined, PlusOutlined } from "@ant-design/icons"
import { RibbonProps } from "antd/lib/badge/Ribbon"
import { cn } from "@/common/util/cn.util"
import useModalControls from "@/common/hooks/useModalControls"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { Issue_StatusMapper } from "@/common/dto/status/Issue.status"
import SelectSparePartDrawer, {
   SelectSparePartDrawerRefType,
} from "@/app/head-staff/_components/SelectSparePart.drawer"
import { TaskStatus } from "@/common/enum/task-status.enum"

type FieldType = {
   request: string
   typeError: string
   description: string
   fixType: FixType
}

type IssuesListProps = {
   id: string
   api: UseQueryResult<FixRequestDto, Error>
   device: UseQueryResult<DeviceDto, Error>
   hasScanned: boolean
   className?: string
}

export type IssuesListRefType = {
   focusCreateIssueBtn: () => void
   openCreateIssueDropdown: () => void
}

const IssuesList = forwardRef<IssuesListRefType, IssuesListProps>(function Component(props, ref) {
   const { message } = App.useApp()
   const [form] = Form.useForm<FieldType>()

   const issueDetailsDrawerRef = useRef<IssueDetailsDrawerRefType | null>(null)
   const SelectSparePartDrawerRef = useRef<null | SelectSparePartDrawerRefType>(null)
   const createIssueBtnRef = useRef<BaseSelectRef | null>(null)
   const createIssueBtnWrapperRef = useRef<HTMLDivElement | null>(null)
   const highlightedTimeoutRef = useRef<NodeJS.Timeout | null>(null)

   const {
      open,
      handleOpen: handleOpen_CreateDrawer,
      handleClose: handleClose_CreateDrawer,
   } = useModalControls({
      onClose: () => {
         setSelectedTypeErrorId(undefined)
         form.resetFields()
      },
   })
   const [createDropdownOpen, setCreateDropdownOpen] = useState(false)
   const [selectedTypeErrorId, setSelectedTypeErrorId] = useState<undefined | string>()
   const [highlightedId, setHighlightedId] = useState<undefined | string>()

   const mutate_createIssue = useMutation({
      mutationFn: HeadStaff_Issue_Create,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "creating-issue",
            content: "Vui lọng chờ đợi...",
         })
      },
      onError: async () => {
         message.error("Tạo vấn đề thất bại")
      },
      onSuccess: async () => {
         message.success("Tạo vấn đề thành công")
      },
      onSettled: () => {
         message.destroy("creating-issue")
      },
   })

   const selectedTypeError = useMemo(() => {
      if (!props.device.isSuccess || !selectedTypeErrorId) return

      return props.device.data.machineModel.typeErrors.find((e) => e.id === selectedTypeErrorId)
   }, [props.device.data, props.device.isSuccess, selectedTypeErrorId])

   const availableTypeErrors = useMemo(() => {
      if (!props.device.isSuccess || !props.api.isSuccess) {
         return undefined
      }

      const addedErrors = new Set(props.api.data.issues.map((issue) => issue.typeError.id))

      return props.device.data.machineModel.typeErrors.filter((error) => !addedErrors.has(error.id))
   }, [props.api.data, props.api.isSuccess, props.device.data, props.device.isSuccess])

   const sortedIssuesByUpdateDate = useMemo(() => {
      if (!props.api.isSuccess) return []

      return props.api.data.issues.sort((a, b) => {
         return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      })
   }, [props.api.data, props.api.isSuccess])

   function handleSelectIssue(issueId: string) {
      setSelectedTypeErrorId(issueId)
      handleOpen_CreateDrawer()
   }

   function handleCreateIssue(values: FieldType) {
      mutate_createIssue.mutate(values, {
         onSuccess: async (res) => {
            handleClose_CreateDrawer()
            form.resetFields()
            await props.api.refetch()
            setTimeout(() => createIssueBtnRef.current?.blur(), 250)

            clearTimeout(highlightedTimeoutRef.current ?? 0)
            setHighlightedId(res.id)
            highlightedTimeoutRef.current = setTimeout(() => {
               setHighlightedId(undefined)
            }, 5000)
         },
      })
   }

   useImperativeHandle(ref, () => {
      return {
         focusCreateIssueBtn: () => {
            createIssueBtnRef.current?.focus()
            createIssueBtnWrapperRef.current?.scrollIntoView({ behavior: "smooth" })
         },
         openCreateIssueDropdown: () => {
            setCreateDropdownOpen(true)
         },
      }
   }, [])

   function IssueCardWithRibbon({
      children,
      ...rest
   }: {
      children: ReactNode
      issue: FixRequestIssueDto
      badgeProps?: RibbonProps
   }) {
      if (props.api.isPending) return children

      if (rest.issue.id === highlightedId) {
         return (
            <Badge.Ribbon text="Mới" color="green">
               {children}
            </Badge.Ribbon>
         )
      }

      if (
         props.api.data?.status === FixRequestStatus.PENDING ||
         props.api.data?.status === FixRequestStatus.APPROVED ||
         props.api.data?.status === FixRequestStatus.IN_PROGRESS ||
         props.api.data?.status === FixRequestStatus.CHECKED
      ) {
         if (rest.issue.task === null) {
            return <Badge.Ribbon text="Chưa có tác vụ">{children}</Badge.Ribbon>
         }

         return (
            <Badge.Ribbon text={Issue_StatusMapper(rest.issue)?.text} color={Issue_StatusMapper(rest.issue)?.color}>
               {children}
            </Badge.Ribbon>
         )
      }

      return children
   }

   async function handleFinish() {
      try {
         await form.validateFields()

         const values = form.getFieldsValue()

         if (!selectedTypeErrorId || !props.api.isSuccess) return
         handleCreateIssue({
            ...values,
            request: props.api.data.id,
            typeError: selectedTypeErrorId,
         })
      } catch (e) {
         message.destroy("error-msg")
         message
            .error({
               content: "Không thể gửi dữ liệu. Vui lòng kiểm tra lại.",
               key: "error-msg",
            })
            .then()
      }
   }

   return (
      <section className={props.className}>
         <RequestDetails.ShowActionByStatus
            api={props.api}
            requiredStatus={[
               FixRequestStatus.PENDING,
               FixRequestStatus.APPROVED,
               FixRequestStatus.IN_PROGRESS,
               FixRequestStatus.CLOSED,
               FixRequestStatus.CHECKED,
            ]}
         >
            <h2 className="mb-2 text-base font-semibold">Yêu cầu vấn đề</h2>
            {props.api.isSuccess ? (
               <>
                  {props.api.data.issues.length === 0 ? (
                     <Card>
                        <Empty description="Báo cáo chưa có lỗi" />
                     </Card>
                  ) : (
                     <IssueDetailsDrawer
                        drawerProps={{
                           placement: "bottom",
                           height: "100%",
                        }}
                        showIssueStatus={props.api.data.status !== FixRequestStatus.PENDING}
                        refetch={props.api.refetch}
                        ref={issueDetailsDrawerRef}
                     >
                        {(handleOpen) => (
                           <div className="space-y-2">
                              {sortedIssuesByUpdateDate.map((item) => (
                                 <IssueCardWithRibbon key={item.id} issue={item}>
                                    <Card
                                       className={cn(
                                          "w-full border-2 border-neutral-200 bg-transparent p-0 transition-all",
                                          item.id === highlightedId && "border-green-200 bg-green-50",
                                       )}
                                       onClick={() => {
                                          props.device.isSuccess &&
                                             props.api.isSuccess &&
                                             handleOpen(
                                                item.id,
                                                props.device.data.id,
                                                /**
                                                 * Only show actions if
                                                 * - User has scanned
                                                 * - and either [Status is PENDING, CHECKED, APPROVED]
                                                 * - or [Status is IN_PROGRESS with either no task or task status is AWAITING_FIXER]
                                                 */
                                                props.hasScanned &&
                                                   (new Set([
                                                      FixRequestStatus.PENDING,
                                                      FixRequestStatus.CHECKED,
                                                      FixRequestStatus.APPROVED,
                                                   ]).has(props.api.data.status) ||
                                                      (props.api.data.status === FixRequestStatus.IN_PROGRESS &&
                                                         (item.task === null ||
                                                            item.task.status === TaskStatus.AWAITING_FIXER))),
                                             )
                                       }}
                                       hoverable
                                       classNames={{
                                          body: "flex p-2.5 items-center",
                                       }}
                                    >
                                       <div className="flex flex-grow flex-col">
                                          <h3 className="font-medium">{item.typeError.name}</h3>
                                          <span className={"mt-1 flex w-full items-center gap-1"}>
                                             <Tag color={FixTypeTagMapper[String(item.fixType)].colorInverse}>
                                                {FixTypeTagMapper[String(item.fixType)].text}
                                             </Tag>
                                             <span className="w-52 flex-grow truncate text-neutral-400">
                                                {item.issueSpareParts.length === 0 ? (
                                                   props.hasScanned ? (
                                                      <Button
                                                         icon={<PlusOutlined />}
                                                         size="small"
                                                         type="link"
                                                         className="px-0"
                                                      >
                                                         Thêm linh kiện
                                                      </Button>
                                                   ) : (
                                                      "Chưa có linh kiện"
                                                   )
                                                ) : (
                                                   `Có ${item.issueSpareParts.length} linh kiện`
                                                )}
                                             </span>
                                             <Button icon={<ArrowRightOutlined />} size="small" type="text"></Button>
                                          </span>
                                       </div>
                                    </Card>
                                 </IssueCardWithRibbon>
                              ))}
                           </div>
                        )}
                     </IssueDetailsDrawer>
                  )}
                  {props.hasScanned && (
                     <div className="mt-2" ref={createIssueBtnWrapperRef}>
                        <Select
                           ref={createIssueBtnRef}
                           options={availableTypeErrors?.map((error) => ({
                              label: error.name,
                              value: error.id,
                           }))}
                           className="w-full"
                           showSearch
                           variant="outlined"
                           size="large"
                           placeholder="+ Thêm lỗi mới"
                           value={selectedTypeErrorId}
                           onChange={(value) => handleSelectIssue(value)}
                           open={createDropdownOpen}
                           onDropdownVisibleChange={setCreateDropdownOpen}
                        />
                     </div>
                  )}
               </>
            ) : (
               <>{props.api.isPending && <Skeleton.Button />}</>
            )}
         </RequestDetails.ShowActionByStatus>
         <Drawer
            open={open}
            onClose={handleClose_CreateDrawer}
            title="Tạo vấn đề"
placement="left"
            height="max-content"
         >
            <ProDescriptions
               dataSource={selectedTypeError}
               size="small"
               className="mb-3"
               title={<span className="text-lg">Thông tin lỗi</span>}
               labelStyle={{
                  fontSize: "var(--font-sub-base)",
               }}
               contentStyle={{
                  fontSize: "var(--font-sub-base)",
               }}
               columns={[
                  {
                     title: "Tên lỗi",
                     dataIndex: ["name"],
                  },
                  {
                     title: "Thời gian sửa chữa",
                     dataIndex: ["duration"],
                     render: (_, e) => `${e.duration} phút`,
                  },
                  {
                     title: "Mô tả",
                     dataIndex: ["description"],
                  },
               ]}
            />
            <Form<FieldType> form={form} className="flex-grow" layout="vertical">
               <Form.Item<FieldType>
                  label={<span className="text-sub-base">Cách sửa</span>}
                  name="fixType"
                  initialValue={FixType.REPLACE}
                  className="w-full"
                  rules={[{ required: true }]}
               >
                  <Radio.Group buttonStyle="solid" size="large" className="w-full">
                     {Object.values(FixType).map((fix) => (
                        <Radio.Button key={fix} value={fix} className="w-1/2 capitalize">
                           <div className="flex items-center gap-2 text-center">
                              {FixTypeTagMapper[String(fix)].icon}
                              {FixTypeTagMapper[String(fix)].text}
                           </div>
                        </Radio.Button>
                     ))}
                  </Radio.Group>
               </Form.Item>
               <ProFormTextArea
                  name="description"
                  label="Mô tả"
                  formItemProps={{
                     className: "mb-10",
                  }}
                  rules={[{ required: true }]}
                  allowClear
                  fieldProps={{
                     showCount: true,
                     maxLength: 300,
                  }}
               />

               {/* Select spare part */}
               {/*<SelectSparePartDrawer onFinish={async (values) => {}}>*/}
               {/*   {(handleOpen) => (*/}
               {/*      <Select*/}
               {/*         options={props.device.data?.machineModel.spareParts.map((sparePart) => ({*/}
               {/*            label: sparePart.name,*/}
               {/*            value: sparePart.id,*/}
               {/*         }))}*/}
               {/*         className="w-full"*/}
               {/*         showSearch*/}
               {/*         size="large"*/}
               {/*         placeholder="+ Chọn linh kiện"*/}
               {/*         onChange={(e) => {*/}
               {/*            props.device.isSuccess && handleOpen(props.device.data.id)*/}
               {/*         }}*/}
               {/*      />*/}
               {/*   )}*/}
               {/*</SelectSparePartDrawer>*/}

               <Form.Item<FieldType> className="mb-0">
                  <Button
                     className="w-full"
                     type="primary"
                     size="large"
                     htmlType="submit"
                     icon={<PlusOutlined />}
                     onClick={handleFinish}
                  >
                     Tạo vấn đề
                  </Button>
               </Form.Item>
            </Form>
         </Drawer>
      </section>
   )
})

export default IssuesList
