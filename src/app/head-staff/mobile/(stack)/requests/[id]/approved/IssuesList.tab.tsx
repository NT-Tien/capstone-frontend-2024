import HeadStaff_Issue_Delete from "@/features/head-maintenance/api/issue/delete.api"
import HeadStaff_SparePart_Delete from "@/features/head-maintenance/api/spare-part/delete.api"
import Issue_ViewDetailsDrawer, {
   IssueDetailsDrawerRefType,
} from "@/features/head-maintenance/components/overlays/Issue_ViewDetails.drawer"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons"
import { CheckCircle, Clock, Dot, Eye, MinusCircle, XCircle } from "@phosphor-icons/react"
import { useMutation, UseQueryResult } from "@tanstack/react-query"
import { App, Button, ConfigProvider, Divider, Dropdown, Empty, FloatButton, Tabs } from "antd"
import { Fragment, useMemo, useRef, useState } from "react"
import Issue_SelectTypeErrorDrawer, {
   CreateIssueModalRefType,
} from "../../../../../../../features/head-maintenance/components/overlays/Issue_SelectTypeError.drawer"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

type Props = {
   api_request: UseQueryResult<RequestDto, Error>
}

function getCount(...ints: number[]) {
   const total = ints.reduce((acc, cur) => acc + cur, 0)
   if (total === 0) return ""
   if (total > 99) return "(99+)"
   return `(${total.toString()})`
}

function IssuesListTab(props: Props) {
   const { modal, message } = App.useApp()

   const IssueDetailsDrawerRef = useRef<IssueDetailsDrawerRefType | null>(null)
   const createIssuesDrawerRef = useRef<CreateIssueModalRefType | null>(null)

   const [tab, setTab] = useState<string>("1")

   const mutate_deleteIssue = useMutation({
      mutationFn: HeadStaff_Issue_Delete,
      onError: (error) => {
         console.error(error)
         message.error("Xóa lỗi thất bại")
      },
   })

   const mutate_deleteIssueSpareParts = useMutation({
      mutationFn: HeadStaff_SparePart_Delete,
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
      } = {
         hasTask: [],
         noTask: [],
      }

      issues.forEach((issue) => {
         if (issue.task === null) {
            result.noTask.push(issue)
         } else {
            result.hasTask.push(issue)
         }
      })

      const statusOrder = {
         [IssueStatusEnum.PENDING]: 1,
         [IssueStatusEnum.FAILED]: 2,
         [IssueStatusEnum.RESOLVED]: 3,
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
      <div>
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
                     label: <div className="py-1">Chưa có tác vụ {getCount(issuesGrouped?.noTask.length || 0)}</div>,
                     children: (
                        <div className="px-layout">
                           {canMutateIssues && (
                              <FloatButton
                                 type="primary"
                                 icon={<PlusOutlined />}
                                 onClick={() =>
                                    props.api_request.isSuccess &&
                                    createIssuesDrawerRef.current?.handleOpen({
                                       deviceId: props.api_request.data.device.id,
                                       request: props.api_request.data,
                                    })
                                 }
                              />
                           )}
                           {issuesGrouped?.noTask.length === 0 && (
                              <div className="grid place-items-center py-12">
                                 <Empty description="Không tìm thấy lỗi nào" />
                              </div>
                           )}
                           {issuesGrouped?.noTask.map((issue, index) => (
                              <Fragment key={issue.id}>
                                 {index !== 0 && <Divider className="my-3" />}
                                 <div className="flex">
                                    <div
                                       className="flex flex-grow cursor-pointer flex-col gap-1"
                                       onClick={() =>
                                          props.api_request.isSuccess &&
                                          IssueDetailsDrawerRef.current?.openDrawer(
                                             issue.id,
                                             props.api_request.data.device.id,
                                             true,
                                          )
                                       }
                                    >
                                       <h4>{issue.typeError.name}</h4>
                                       <div className="flex text-neutral-500">
                                          <div className={cn("flex gap-1", FixTypeTagMapper[issue.fixType].className)}>
                                             {FixTypeTagMapper[issue.fixType].icon}
                                             {FixTypeTagMapper[issue.fixType].text}
                                          </div>
                                          <Dot size={24} />
                                          <div className="flex items-center gap-1">
                                             <Clock size={16} />
                                             {issue.typeError.duration} phút
                                          </div>
                                       </div>
                                    </div>
                                    <Dropdown
                                       menu={{
                                          items: [
                                             {
                                                key: "create-task",
                                                label: "Thêm vào tác vụ",
                                                icon: <PlusOutlined />,
                                                onClick: () => {
                                                   // TODO add
                                                },
                                             },
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
                     ),
                  },
                  {
                     key: "2",
                     label: <div className="py-1">Đã có tác vụ {getCount(issuesGrouped?.hasTask.length || 0)}</div>,
                     children: (
                        <div className="grid grid-cols-1 px-layout">
                           {issuesGrouped?.hasTask.length === 0 && (
                              <div className="grid place-items-center py-12">
                                 <Empty description="Không tìm thấy lỗi nào" />
                              </div>
                           )}
                           {issuesGrouped?.hasTask.map((issue, index, array) => (
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
                                          IssueDetailsDrawerRef.current?.openDrawer(
                                             issue.id,
                                             props.api_request.data.device.id,
                                             false,
                                          )
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
                                          IssueDetailsDrawerRef.current?.openDrawer(
                                             issue.id,
                                             props.api_request.data.device.id,
                                             false,
                                          )
                                       }
                                    >
                                       <h4>{issue.typeError.name}</h4>
                                       <div className="flex text-neutral-500">
                                          <div className={cn("flex gap-1", FixTypeTagMapper[issue.fixType].className)}>
                                             {FixTypeTagMapper[issue.fixType].icon}
                                             {FixTypeTagMapper[issue.fixType].text}
                                          </div>
                                          <Dot size={24} />
                                          <div className="flex items-center gap-1">
                                             <Clock size={16} />
                                             {issue.typeError.duration} phút
                                          </div>
                                       </div>
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
               ]}
            />
         </ConfigProvider>
         <Issue_ViewDetailsDrawer refetch={props.api_request.refetch} ref={IssueDetailsDrawerRef} />
         <Issue_SelectTypeErrorDrawer onFinish={props.api_request.refetch} ref={createIssuesDrawerRef} />
      </div>
   )
}

export default IssuesListTab
