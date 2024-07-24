import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { useMutation, UseQueryResult } from "@tanstack/react-query"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { DeviceDto } from "@/common/dto/Device.dto"
import React, {
   cloneElement,
   forwardRef,
   ReactNode,
   useEffect,
   useImperativeHandle,
   useMemo,
   useRef,
   useState,
} from "react"
import { App, Badge, Button, Card, Drawer, Empty, Form, List, Radio, Select, Skeleton, Tag } from "antd"
import { BaseSelectRef } from "rc-select"
import HeadStaff_Issue_Create from "@/app/head-staff/_api/issue/create.api"
import IssueDetailsDrawer from "@/app/head-staff/_components/IssueDetailsDrawer"
import { FixRequestStatus, FixRequestStatusTagMapper } from "@/common/enum/fix-request-status.enum"
import { IssueStatusEnumTagMapper } from "@/common/enum/issue-status.enum"
import { ProDescriptions, ProFormTextArea } from "@ant-design/pro-components"
import RequestDetails from "@/app/head-staff/mobile/(stack)/requests/[id]/page"
import { ArrowRightOutlined } from "@ant-design/icons"
import { RibbonProps } from "antd/lib/badge/Ribbon"
import { cn } from "@/common/util/cn.util"

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

   const createIssueBtnRef = useRef<BaseSelectRef | null>(null)
   const createIssueBtnWrapperRef = useRef<HTMLDivElement | null>(null)
   const highlightedTimeoutRef = useRef<NodeJS.Timeout | null>(null)

   const [createDropdownOpen, setCreateDropdownOpen] = useState(false)
   const [createDrawerOpen, setCreateDrawerOpen] = useState(false)
   const [selectedTypeErrorId, setSelectedTypeErrorId] = useState<undefined | string>()
   const [highlightedId, setHighlightedId] = useState<undefined | string>()

   const mutate_createIssue = useMutation({
      mutationFn: HeadStaff_Issue_Create,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "creating-issue",
            content: "Creating issue...",
         })
      },
      onError: async () => {
         message.error("Failed to create issue")
      },
      onSuccess: async () => {
         message.success("Issue created")
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

   function handleClose_CreateDrawer() {
      setCreateDrawerOpen(false)
      setSelectedTypeErrorId(undefined)
      form.resetFields()
   }

   function handleSelectIssue(issueId: string) {
      setCreateDrawerOpen(true)
      setSelectedTypeErrorId(issueId)
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

   function IssueCardWithRibbon({ children, ...rest }: { children: ReactNode; id: string; badgeProps?: RibbonProps }) {
      if (rest.id === highlightedId) {
         return (
            <Badge.Ribbon text="New" color="green">
               {children}
            </Badge.Ribbon>
         )
      }
      if (props.api.data?.status !== FixRequestStatus.PENDING) {
         return <Badge.Ribbon {...rest.badgeProps}>{children}</Badge.Ribbon>
      }
      return children
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
            ]}
         >
            <h2 className="mb-2 text-base font-semibold">Request Issues</h2>
            {props.api.isSuccess ? (
               <>
                  {props.api.data.issues.length === 0 ? (
                     <Card>
                        <Empty description="There are no issues" />
                     </Card>
                  ) : (
                     <IssueDetailsDrawer
                        showActions={props.hasScanned}
                        drawerProps={{
                           placement: "bottom",
                           height: "100%",
                        }}
                        showIssueStatus={props.api.data.status !== FixRequestStatus.PENDING}
                        refetch={props.api.refetch}
                     >
                        {(handleOpen) => (
                           <div className="space-y-2">
                              {sortedIssuesByUpdateDate.map((item) => (
                                 <IssueCardWithRibbon
                                    key={item.id}
                                    id={item.id}
                                    badgeProps={{
                                       text: FixRequestStatusTagMapper[String(item.status)].text,
                                       color: FixRequestStatusTagMapper[String(item.status)].color,
                                    }}
                                 >
                                    <Card
                                       className={cn(
                                          "w-full border-2 border-neutral-200 bg-transparent p-0 transition-all",
                                          item.id === highlightedId && "border-green-200 bg-green-50",
                                       )}
                                       onClick={() => {
                                          props.device.isSuccess && handleOpen(item.id, props.device.data.id)
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
                                                {item.description}
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
                           placeholder="+ Create New Issue"
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
            open={createDrawerOpen}
            onClose={handleClose_CreateDrawer}
            title="Create Issue"
            placement="bottom"
            height="max-content"
         >
            <ProDescriptions
               dataSource={selectedTypeError}
               size="small"
               className="mb-3"
               title={<span className="text-lg">Error Details</span>}
               labelStyle={{
                  fontSize: "var(--font-sub-base)",
               }}
               contentStyle={{
                  fontSize: "var(--font-sub-base)",
               }}
               columns={[
                  {
                     title: "Error Name",
                     dataIndex: ["name"],
                  },
                  {
                     title: "Duration",
                     dataIndex: ["duration"],
                  },
                  {
                     title: "Description",
                     dataIndex: ["description"],
                  },
               ]}
            />
            <Form<FieldType>
               form={form}
               onFinish={(values) => {
                  if (!selectedTypeErrorId || !props.api.isSuccess) return
                  handleCreateIssue({
                     ...values,
                     request: props.api.data.id,
                     typeError: selectedTypeErrorId,
                  })
               }}
               className="flex-grow"
               layout="vertical"
            >
               <Form.Item<FieldType>
                  label={<span className="text-sub-base">Fix Type</span>}
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
                  label="Description"
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
               <Form.Item<FieldType> className="mb-0">
                  <Button className="w-full" type="primary" size="large" htmlType="submit">
                     Create Issue
                  </Button>
               </Form.Item>
            </Form>
         </Drawer>
      </section>
   )
})

export default IssuesList
