import { App, Button, Card, Descriptions, Drawer, DrawerProps, Dropdown, Empty, Image, Space, Tag } from "antd"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { useMemo, useRef } from "react"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import { DeleteOutlined, EditOutlined, MoreOutlined, ReloadOutlined } from "@ant-design/icons"
import Issue_CreateDetailsDrawer, {
   CreateSingleIssueDrawerRefType,
} from "@/features/head-maintenance/components/overlays/Issue_CreateDetails.drawer"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { cn } from "@/lib/utils/cn.util"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import { clientEnv } from "@/env"

type IssueDetailsDrawerProps = {
   issueId?: string
   deviceId?: string
   refetchFn?: () => void
}
type Props = Omit<DrawerProps, "children"> & IssueDetailsDrawerProps & { handleClose?: () => void }

function IssueDetailsDrawer(props: Props) {
   const { modal } = App.useApp()
   const control_issueCreateDetailsDrawer = useRef<CreateSingleIssueDrawerRefType | null>(null)

   const api_issue = head_maintenance_queries.issue.one(
      {
         id: props.issueId ?? "",
      },
      {
         enabled: !!props.issueId,
      },
   )
   const api_device = head_maintenance_queries.device.one(
      {
         id: props.deviceId ?? "",
      },
      {
         enabled: !!props.deviceId,
      },
   )

   const mutate_cancelIssue = head_maintenance_mutations.issue.cancel()
   const mutate_updateFull = head_maintenance_mutations.issue.updateFull()

   const issueSpareParts = useMemo(() => {
      if (!api_issue.isSuccess) return []
      return api_issue.data.issueSpareParts.sort((a, b) => {
         return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
   }, [api_issue.isSuccess, api_issue.data])

   const hasTask = useMemo(() => {
      if (!api_issue.isSuccess) return false
      return !!api_issue.data.task
   }, [api_issue.data?.task, api_issue.isSuccess])

   const showActions = useMemo(() => {
      return (
         (api_issue.data?.status === IssueStatusEnum.PENDING && !api_issue.data?.task) ||
         api_issue.data?.status === IssueStatusEnum.FAILED
      )
   }, [api_issue.data?.status, api_issue.data?.task])

   function handleCancelIssue(issueId: string) {
      modal.confirm({
         title: "Lưu ý",
         content: "Bạn có chắc chắn muốn hủy lỗi này?",
         okText: "Hủy lỗi",
         okButtonProps: {
            danger: true,
         },
         cancelText: "Đóng",
         closable: true,
         maskClosable: true,
         centered: true,
         onOk: async () => {
            await mutate_cancelIssue.mutateAsync(
               {
                  id: issueId,
               },
               {
                  onSuccess: () => {
                     props.handleClose?.()
                     props.refetchFn?.()
                  },
               },
            )
         },
      })
   }

   async function handleUpdateIssue(oldIssue: IssueDto, newIssue: IssueDto) {
      await mutate_updateFull.mutateAsync(
         {
            issueId: oldIssue.id,
            newIssue,
            oldIssueSparePartIds: oldIssue.issueSpareParts.map((isp) => isp.id),
         },
         {
            onSettled: async () => {
               await api_issue.refetch()
               props.refetchFn?.()
            },
         },
      )
   }

   return (
      <Drawer
         title="Thông tin lỗi"
         placement="right"
         width="100%"
         classNames={{
            footer: "p-layout",
         }}
         footer={
            showActions ? (
               <div className="flex w-full items-center gap-3">
                  <Button
                     key="update"
                     block
                     size="large"
                     type="primary"
                     icon={<EditOutlined />}
                     onClick={() =>
                        api_issue.isSuccess &&
                        api_device.isSuccess &&
                        control_issueCreateDetailsDrawer.current?.handleOpen({
                           defaultIssue: api_issue.data,
                           device: api_device.data,
                           typeError: api_issue.data.typeError,
                        })
                     }
                  >
                     Cập nhật
                  </Button>
                  <Dropdown
                     menu={{
                        items: [
                           {
                              label: "Hủy lỗi",
                              key: "cancel",
                              icon: <DeleteOutlined />,
                              danger: true,
                              onClick: () => props.issueId && handleCancelIssue(props.issueId),
                           },
                        ],
                     }}
                  >
                     <Button size="large" icon={<MoreOutlined />} className="aspect-square" />
                  </Dropdown>
               </div>
            ) : undefined
         }
         {...props}
      >
         <Descriptions
            colon={false}
            contentStyle={{
               justifyContent: "end",
            }}
            size="small"
            items={[
               {
                  label: "Tên lỗi",
                  children: api_issue.data?.typeError.name,
               },
               {
                  label: "Trạng thái",
                  children: api_issue.isSuccess ? (
                     <Tag className="m-0" color={IssueStatusEnumTagMapper[api_issue.data.status].colorInverse}>
                        {IssueStatusEnumTagMapper[api_issue.data.status].text}
                     </Tag>
                  ) : (
                     "-"
                  ),
               },
               {
                  label: "Loại sửa chữa",
                  children: api_issue.isSuccess ? (
                     <Tag className="m-0" color={FixTypeTagMapper[String(api_issue.data.fixType)].color}>
                        {FixTypeTagMapper[String(api_issue.data.fixType)].text}
                     </Tag>
                  ) : (
                     "-"
                  ),
               },
               {
                  label: "Thời gian sửa chữa",
                  children: (api_issue.data?.typeError.duration ?? "-") + " phút",
               },
               {
                  label: "Tác vụ",
                  children: api_issue.data?.task?.name,
                  className: cn(hasTask ? "block" : "hidden"),
               },
               {
                  label: "Mô tả",
                  children: api_issue.data?.description,
               },
            ]}
         />
         {api_issue.data?.status === IssueStatusEnum.FAILED && (
            <section className="mt-layout">
               <h2 className="mb-2 text-lg font-semibold">Lý do không hoàn thành</h2>
               <span>{api_issue.data?.failReason}</span>
            </section>
         )}
         {api_issue.data?.status === IssueStatusEnum.RESOLVED && (
            <article className="mt-layout">
               <h2 className="mb-2 text-lg font-semibold">Minh chứng sửa chữa</h2>
               <section>
                  <h2 className="mb-2 text-sub-base font-medium">Hình ảnh minh chứng</h2>
                  {api_issue.data?.imagesVerify.find((img) => !!img) ? (
                     <div className="flex items-center gap-3">
                        {api_issue.data?.imagesVerify.map((img) => (
                           <Image
                              key={img}
                              src={clientEnv.BACKEND_URL + `/file-image/${img}`}
                              alt="image"
                              className="h-20 w-20 rounded-lg"
                           />
                        ))}
                     </div>
                  ) : (
                     <div className="grid h-20 w-full place-content-center rounded-lg bg-neutral-100">Không có</div>
                  )}
               </section>
               <section className="mt-4">
                  <h2 className="mb-2 text-sub-base font-medium">Video minh chứng</h2>
                  {api_issue.isSuccess ? (
                     !!api_issue.data.videosVerify ? (
                        <video width="100%" height="240" controls>
                           <source
                              src={clientEnv.BACKEND_URL + `/file-video/${api_issue.data.videosVerify}`}
                              type="video/mp4"
                           />
                        </video>
                     ) : (
                        <div className="grid h-20 w-full place-content-center rounded-lg bg-neutral-100">Không có</div>
                     )
                  ) : null}
               </section>
            </article>
         )}
         <section className="mt-layout">
            <header className="mb-2 flex items-center justify-between">
               <h2 className="text-lg font-semibold">Linh kiện</h2>
               <Button type="default" size="small" icon={<ReloadOutlined />} onClick={() => api_issue.refetch()} />
            </header>
            {issueSpareParts.length === 0 ? (
               <Card className="mt-3">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Lỗi này không cần linh kiện để hoàn thành" />
               </Card>
            ) : (
               <Card size="small" className="h-48 w-full overflow-y-auto rounded-lg bg-neutral-50">
                  {issueSpareParts.map((isp, index) => (
                     <div key={isp.id} className="flex justify-between">
                        <h3>
                           {index + 1}. {isp.sparePart.name}
                        </h3>
                        <div>
                           {isp.quantity > isp.sparePart.quantity && <Tag color="yellow">Hết hàng</Tag>}
                           <span>x{isp.quantity}</span>
                        </div>
                     </div>
                  ))}
               </Card>
            )}
         </section>
         <Issue_CreateDetailsDrawer
            ref={control_issueCreateDetailsDrawer}
            onFinish={(newIssue) => api_issue.isSuccess && handleUpdateIssue(api_issue.data, newIssue)}
         />
      </Drawer>
   )
}

export default IssueDetailsDrawer
export type { IssueDetailsDrawerProps }
