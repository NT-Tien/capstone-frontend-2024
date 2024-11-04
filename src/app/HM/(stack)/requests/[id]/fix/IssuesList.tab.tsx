import HeadStaff_Issue_Delete from "@/features/head-maintenance/api/issue/delete.api"
import HeadStaff_IssueSparePart_Delete from "@/features/head-maintenance/api/spare-part/delete.api"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons"
import { CheckCircle, CircleDashed, Clock, Dot, Eye, MinusCircle, Wrench, XCircle } from "@phosphor-icons/react"
import { useMutation, UseQueryResult } from "@tanstack/react-query"
import { App, Button, Checkbox, ConfigProvider, Divider, Dropdown, Empty, FloatButton, Space, Tabs } from "antd"
import { Fragment, useMemo, useRef, useState } from "react"
import Issue_SelectTypeErrorDrawer, {
   CreateIssueModalRefType,
} from "../../../../../../features/head-maintenance/components/overlays/Issue_SelectTypeError.drawer"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import IssueDetailsDrawer, {
   IssueDetailsDrawerProps,
} from "@/features/head-maintenance/components/overlays/Issue_Details.drawer"
import IssueUtil from "@/lib/domain/Issue/Issue.util"

function getCount(...ints: number[]) {
   const total = ints.reduce((acc, cur) => acc + cur, 0)
   if (total === 0) return ""
   if (total > 99) return "(99+)"
   return `(${total.toString()})`
}

type Props = {
   api_request: UseQueryResult<RequestDto, Error>
   handleOpenTaskCreate: (requestId: string, defaultIssueIds: string[]) => void
}

function IssuesListTab(props: Props) {
   const { modal, message } = App.useApp()

   const createIssuesDrawerRef = useRef<CreateIssueModalRefType | null>(null)
   const control_issueDetailsDrawer = useRef<RefType<IssueDetailsDrawerProps>>(null)

   const [tab, setTab] = useState<string>("1")
   const [selectedIssues, setSelectedIssues] = useState<{ [issueId: string]: IssueDto }>({})

   const mutate_deleteIssue = useMutation({
      mutationFn: HeadStaff_Issue_Delete,
      onError: (error) => {
         console.error(error)
         message.error("Xóa lỗi thất bại")
      },
   })

   const mutate_deleteIssueSpareParts = useMutation({
      mutationFn: HeadStaff_IssueSparePart_Delete,
      onError: (error) => {
         console.error(error)
         message.error("Xóa linh kiện thất bại")
      },
   })

   const issuesGrouped = useMemo(() => {
      if (!props.api_request.isSuccess) return
      const issues = props.api_request.data.issues
      const result: {
         hasTask: IssueDto[]
         noTask: IssueDto[]
         cancelled: IssueDto[]
      } = {
         hasTask: [],
         noTask: [],
         cancelled: [],
      }

      issues.forEach((issue) => {
         if (issue.status === IssueStatusEnum.CANCELLED) {
            result.cancelled.push(issue)
         } else if (issue.task === null) {
            result.noTask.push(issue)
         } else {
            result.hasTask.push(issue)
         }
      })

      const statusOrder: {
         [key in IssueStatusEnum]: number
      } = {
         [IssueStatusEnum.PENDING]: 1,
         [IssueStatusEnum.FAILED]: 2,
         [IssueStatusEnum.RESOLVED]: 3,
         [IssueStatusEnum.CANCELLED]: 4,
      }

      result.hasTask.sort((a, b) => {
         return statusOrder[a.status] - statusOrder[b.status]
      })

      return result
   }, [props.api_request.data?.issues, props.api_request.isSuccess])

   const canMutateIssues = useMemo(() => {
      if (!props.api_request.isSuccess) return false

      return props.api_request.data.tasks.length === 0 && props.api_request.data.status === FixRequestStatus.APPROVED
   }, [props.api_request.data?.status, props.api_request.data?.tasks.length, props.api_request.isSuccess])

   async function handleDeleteIssue(issue: IssueDto) {
      message.destroy("delete-issue")
      message.loading({
         content: "Đang xóa lỗi...",
         key: "delete-issue",
      })

      await Promise.all(
         issue.issueSpareParts.map((sp) => {
            mutate_deleteIssueSpareParts.mutateAsync({
               id: sp.id,
            })
         }),
      )

      await mutate_deleteIssue.mutateAsync(
         {
            id: issue.id,
         },
         {
            onSuccess: () => {
               props.api_request.refetch()
            },
         },
      )

      message.destroy("delete-issue")
      message.success("Xóa lỗi thành công")
   }

   return (
      <div className={"pb-24"}>
         <ConfigProvider
            theme={{
               components: {
                  Tabs: {
                     inkBarColor: "#a3a3a3",
                     itemActiveColor: "#737373",
                     itemSelectedColor: "#737373",
                     itemColor: "#a3a3a3",
                     titleFontSize: 14,
                  },
               },
            }}
         >
            <Tabs
               activeKey={tab}
               onChange={setTab}
               className="test-tabs"
               animated={{
                  inkBar: true,
                  tabPane: true,
               }}
               items={[
                  {
                     key: "1",
                     label: <div className="py-1">Chưa tác vụ {getCount(issuesGrouped?.noTask.length || 0)}</div>,
                     children: (
                        <>
                           <div className="grid grid-cols-1 text-sm *:px-layout-half">
                              {issuesGrouped?.noTask.length === 0 && (
                                 <div className="grid place-items-center py-12">
                                    <Empty description="Không tìm thấy lỗi nào" />
                                 </div>
                              )}
                              {issuesGrouped?.noTask.map((issue, index, array) => (
                                 <Fragment key={issue.id}>
                                    {index !== 0 && (
                                       <div className="grid grid-cols-[20px_1fr] gap-3">
                                          {(array[index - 1] === undefined ||
                                             array[index - 1]?.status === issue.status) && <div></div>}
                                          <Divider
                                             className={cn(
                                                "my-0",
                                                array[index - 1] !== undefined &&
                                                   array[index - 1]?.status !== issue.status &&
                                                   "col-span-2",
                                             )}
                                          />
                                       </div>
                                    )}
                                    <div
                                       className={cn(
                                          "grid cursor-pointer grid-cols-[20px_1fr_20px] gap-3 py-3",
                                          !!selectedIssues[issue.id] && "bg-[#176b37] bg-opacity-10",
                                       )}
                                    >
                                       <div>
                                          <Checkbox
                                             checked={!!selectedIssues[issue.id]}
                                             onChange={(e) => {
                                                if (e.target.checked) {
                                                   setSelectedIssues((prev) => {
                                                      return {
                                                         ...prev,
                                                         [issue.id]: issue,
                                                      }
                                                   })
                                                } else {
                                                   setSelectedIssues((prev) => {
                                                      const next = { ...prev }
                                                      delete next[issue.id]
                                                      return next
                                                   })
                                                }
                                             }}
                                          />
                                       </div>
                                       <div
                                          className="flex flex-grow cursor-pointer flex-col gap-1"
                                          onClick={() =>
                                             props.api_request.isSuccess &&
                                             control_issueDetailsDrawer.current?.handleOpen({
                                                issueId: issue.id,
                                                deviceId: props.api_request.data.device.id,
                                             })
                                          }
                                       >
                                          <h4>{issue.typeError.name}</h4>
                                          <Space
                                             split={<Divider type={"vertical"} className={"mx-2"} />}
                                             size={0}
                                             className="flex text-neutral-500"
                                          >
                                             <div
                                                className={cn(
                                                   "flex gap-1 whitespace-nowrap",
                                                   FixTypeTagMapper[issue.fixType].className,
                                                )}
                                             >
                                                {FixTypeTagMapper[issue.fixType].icon}
                                                {FixTypeTagMapper[issue.fixType].text}
                                             </div>
                                             <div className="flex items-center gap-1 whitespace-nowrap">
                                                <Clock size={16} />
                                                {issue.typeError.duration} phút
                                             </div>
                                             {issue.issueSpareParts.length > 0 && (
                                                <div
                                                   className={cn(
                                                      "flex items-center gap-1 whitespace-nowrap",
                                                      IssueUtil.hasOutOfStockIssueSpareParts(issue) &&
                                                         "text-yellow-500",
                                                   )}
                                                >
                                                   <Wrench size={16} />
                                                   {issue.issueSpareParts?.length ?? 0} linh kiện
                                                </div>
                                             )}
                                          </Space>
                                       </div>
                                       <Dropdown
                                          menu={{
                                             items: [
                                                ...(canMutateIssues
                                                   ? [
                                                        {
                                                           key: "edit",
                                                           label: "Cập nhật",
                                                           icon: <EditOutlined />,
                                                        },
                                                        {
                                                           key: "delete-issue",
                                                           label: "Xóa",
                                                           icon: <DeleteOutlined />,
                                                           danger: true,
                                                           onClick: () => {
                                                              modal.confirm({
                                                                 closable: true,
                                                                 maskClosable: true,
                                                                 type: "warn",
                                                                 title: "Lưu ý",
                                                                 content: "Bạn có chắc chắn muốn xóa lỗi này?",
                                                                 okText: "Xóa",
                                                                 centered: true,
                                                                 okButtonProps: {
                                                                    danger: true,
                                                                 },
                                                                 cancelText: "Hủy",
                                                                 onOk: () => {
                                                                    handleDeleteIssue(issue)
                                                                 },
                                                              })
                                                           },
                                                        },
                                                     ]
                                                   : []),
                                             ],
                                          }}
                                       >
                                          <Button icon={<MoreOutlined />} size="small" type="text" />
                                       </Dropdown>
                                    </div>
                                 </Fragment>
                              ))}
                           </div>
                           <section
                              className={
                                 "fixed bottom-0 left-0 flex w-full items-center gap-3 bg-white p-layout shadow-fb"
                              }
                           >
                              <Button
                                 block
                                 type={"primary"}
                                 disabled={Object.keys(selectedIssues).length <= 0}
                                 onClick={() => {
                                    props.api_request.isSuccess &&
                                       props.handleOpenTaskCreate(
                                          props.api_request.data.id,
                                          Object.keys(selectedIssues),
                                       )
                                    setSelectedIssues({})
                                 }}
                              >
                                 {Object.keys(selectedIssues).length > 0
                                    ? `Tạo tác vụ mới với ${Object.keys(selectedIssues).length} lỗi`
                                    : "Chọn lỗi để tạo tác vụ"}
                              </Button>
                              <Dropdown
                                 menu={{
                                    items: [
                                       {
                                          key: "add-issue",
                                          label: "Thêm lỗi mới",
                                          icon: <PlusOutlined />,
                                          onClick: () =>
                                             props.api_request.isSuccess &&
                                             createIssuesDrawerRef.current?.handleOpen({
                                                deviceId: props.api_request.data.device.id,
                                                request: props.api_request.data,
                                             }),
                                       },
                                    ],
                                 }}
                              >
                                 <Button icon={<MoreOutlined />} className={"aspect-square"} />
                              </Dropdown>
                           </section>
                        </>
                     ),
                  },
                  {
                     key: "2",
                     label: <div className="py-1">Có tác vụ {getCount(issuesGrouped?.hasTask.length || 0)}</div>,
                     children: (
                        <div className="grid grid-cols-1 px-layout-half text-sm">
                           {issuesGrouped?.hasTask.length === 0 && (
                              <div className="grid place-items-center py-12">
                                 <Empty description="Không tìm thấy lỗi nào" />
                              </div>
                           )}
                           {issuesGrouped?.hasTask.map((issue, index, array) => (
                              <Fragment key={issue.id}>
                                 {index !== 0 && (
                                    <div className="grid grid-cols-[20px_1fr] gap-3">
                                       {(array[index - 1] === undefined ||
                                          array[index - 1]?.status === issue.status) && <div></div>}
                                       <Divider
                                          className={cn(
                                             "my-3",
                                             array[index - 1] !== undefined &&
                                                array[index - 1]?.status !== issue.status &&
                                                "col-span-2",
                                          )}
                                       />
                                    </div>
                                 )}
                                 <div className="grid cursor-pointer grid-cols-[20px_1fr_20px] gap-3">
                                    <div
                                       onClick={() =>
                                          props.api_request.isSuccess &&
                                          control_issueDetailsDrawer.current?.handleOpen({
                                             issueId: issue.id,
                                             deviceId: props.api_request.data.device.id,
                                          })
                                       }
                                    >
                                       {issue.status === IssueStatusEnum.PENDING && (
                                          <MinusCircle
                                             size={24}
                                             weight="fill"
                                             className={IssueStatusEnumTagMapper[issue.status].className}
                                          />
                                       )}
                                       {issue.status === IssueStatusEnum.RESOLVED && (
                                          <CheckCircle
                                             size={24}
                                             weight="fill"
                                             className={IssueStatusEnumTagMapper[issue.status].className}
                                          />
                                       )}
                                       {issue.status === IssueStatusEnum.FAILED && (
                                          <XCircle
                                             size={24}
                                             weight="fill"
                                             className={IssueStatusEnumTagMapper[issue.status].className}
                                          />
                                       )}
                                    </div>
                                    <div
                                       className="flex flex-col gap-1"
                                       onClick={() =>
                                          props.api_request.isSuccess &&
                                          control_issueDetailsDrawer.current?.handleOpen({
                                             issueId: issue.id,
                                             deviceId: props.api_request.data.device.id,
                                          })
                                       }
                                    >
                                       <h4>{issue.typeError.name}</h4>
                                       <Space split={<Dot size={20} />} size={0} className="flex text-neutral-500">
                                          <div
                                             className={cn(
                                                "flex gap-1 whitespace-nowrap",
                                                FixTypeTagMapper[issue.fixType].className,
                                             )}
                                          >
                                             {FixTypeTagMapper[issue.fixType].icon}
                                             {FixTypeTagMapper[issue.fixType].text}
                                          </div>
                                          <div className="flex items-center gap-1 whitespace-nowrap">
                                             <Clock size={16} />
                                             {issue.typeError.duration} phút
                                          </div>
                                          <div className="flex items-center gap-1 whitespace-nowrap">
                                             <Wrench size={16} />
                                             {issue.issueSpareParts?.length ?? 0} linh kiện
                                          </div>
                                       </Space>
                                    </div>
                                    <Dropdown
                                       menu={{
                                          items: [
                                             {
                                                key: "view-task",
                                                label: "Xem tác vụ",
                                                icon: <Eye />,
                                             },
                                          ],
                                       }}
                                    >
                                       <Button icon={<MoreOutlined />} size="small" type="text" />
                                    </Dropdown>
                                 </div>
                              </Fragment>
                           ))}
                        </div>
                     ),
                  },
                  {
                     key: "3",
                     label: <div className="py-1">Đã hủy {getCount(issuesGrouped?.cancelled.length || 0)}</div>,
                     children: (
                        <div className="grid grid-cols-1 px-layout-half text-sm">
                           {issuesGrouped?.cancelled.length === 0 && (
                              <div className="grid place-items-center py-12">
                                 <Empty description="Không tìm thấy lỗi nào" />
                              </div>
                           )}
                           {issuesGrouped?.cancelled.map((issue, index, array) => (
                              <Fragment key={issue.id}>
                                 {index !== 0 && (
                                    <div className="grid grid-cols-[24px_1fr] gap-4">
                                       {(array[index - 1] === undefined ||
                                          array[index - 1]?.status === issue.status) && <div></div>}
                                       <Divider
                                          className={cn(
                                             "my-3",
                                             array[index - 1] !== undefined &&
                                                array[index - 1]?.status !== issue.status &&
                                                "col-span-2",
                                          )}
                                       />
                                    </div>
                                 )}
                                 <div className="grid cursor-pointer grid-cols-[24px_1fr_24px] gap-4">
                                    <div
                                       onClick={() =>
                                          props.api_request.isSuccess &&
                                          control_issueDetailsDrawer.current?.handleOpen({
                                             issueId: issue.id,
                                             deviceId: props.api_request.data.device.id,
                                          })
                                       }
                                    >
                                       {issue.status === IssueStatusEnum.PENDING && (
                                          <MinusCircle
                                             size={24}
                                             weight="fill"
                                             className={IssueStatusEnumTagMapper[issue.status].className}
                                          />
                                       )}
                                       {issue.status === IssueStatusEnum.RESOLVED && (
                                          <CheckCircle
                                             size={24}
                                             weight="fill"
                                             className={IssueStatusEnumTagMapper[issue.status].className}
                                          />
                                       )}
                                       {issue.status === IssueStatusEnum.FAILED && (
                                          <XCircle
                                             size={24}
                                             weight="fill"
                                             className={IssueStatusEnumTagMapper[issue.status].className}
                                          />
                                       )}
                                       {issue.status === IssueStatusEnum.CANCELLED && (
                                          <CircleDashed
                                             size={24}
                                             weight="fill"
                                             className={IssueStatusEnumTagMapper[issue.status].className}
                                          />
                                       )}
                                    </div>
                                    <div
                                       className="flex flex-col gap-1"
                                       onClick={() =>
                                          props.api_request.isSuccess &&
                                          control_issueDetailsDrawer.current?.handleOpen({
                                             issueId: issue.id,
                                             deviceId: props.api_request.data.device.id,
                                          })
                                       }
                                    >
                                       <h4>{issue.typeError.name}</h4>
                                       <Space split={<Dot size={20} />} size={0} className="flex text-neutral-500">
                                          <div
                                             className={cn(
                                                "flex gap-1 whitespace-nowrap",
                                                FixTypeTagMapper[issue.fixType].className,
                                             )}
                                          >
                                             {FixTypeTagMapper[issue.fixType].icon}
                                             {FixTypeTagMapper[issue.fixType].text}
                                          </div>
                                          <div className="flex items-center gap-1 whitespace-nowrap">
                                             <Clock size={16} />
                                             {issue.typeError.duration} phút
                                          </div>
                                          <div className="flex items-center gap-1 whitespace-nowrap">
                                             <Wrench size={16} />
                                             {issue.issueSpareParts?.length ?? 0} linh kiện
                                          </div>
                                       </Space>
                                    </div>
                                 </div>
                              </Fragment>
                           ))}
                        </div>
                     ),
                  },
               ]}
            />
         </ConfigProvider>
         <OverlayControllerWithRef ref={control_issueDetailsDrawer}>
            <IssueDetailsDrawer refetchFn={() => props.api_request.refetch()} />
         </OverlayControllerWithRef>
         <Issue_SelectTypeErrorDrawer onFinish={() => props.api_request.refetch()} ref={createIssuesDrawerRef} />
      </div>
   )
}

export default IssuesListTab
