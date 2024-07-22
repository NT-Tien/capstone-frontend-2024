"use client"

import RootHeader from "@/common/components/RootHeader"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import { ProDescriptions, ProFormTextArea } from "@ant-design/pro-components"
import { CloseOutlined, LeftOutlined, PlusOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { App, Button, Card, Drawer, Form, List, Radio, Select, Skeleton, Tabs, Tag } from "antd"
import { FixRequestStatus, FixRequestStatusTagMapper } from "@/common/enum/issue-request-status.enum"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import RejectTaskDrawer from "@/app/head-staff/_components/RejectTask.drawer"
import { useTranslation } from "react-i18next"
import React, { Dispatch, forwardRef, ReactNode, SetStateAction, useCallback, useMemo, useRef, useState } from "react"
import { CheckSquareOffset, MapPin, Tray, XCircle } from "@phosphor-icons/react"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { useIssueRequestStatusTranslation } from "@/common/enum/use-issue-request-status-translation"
import { cn } from "@/common/util/cn.util"
import DataListView from "@/common/components/DataListView"
import ScannerDrawer from "@/common/components/Scanner.drawer"
import { isUUID } from "@/common/util/isUUID.util"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import IssueDetailsDrawer from "@/app/head-staff/desktop/requests/[id]/IssueDetailsDrawer"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { DeviceDto } from "@/common/dto/Device.dto"
import HeadStaff_Issue_Create from "@/app/head-staff/_api/issue/create.api"

export default function RequestDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { t } = useTranslation()
   const { message } = App.useApp()

   const issueInputRef = useRef<HTMLInputElement>()

   const [tab, setTab] = useState<string>("main-tab-request")
   const [hasScanned, setHasScanned] = useState(false)
   const [issueDrawerOpen, setIssueDrawerOpen] = useState(false)

   const api = useQuery({
      queryKey: headstaff_qk.request.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
   })

   const device = useQuery({
      queryKey: headstaff_qk.device.byId(api.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: api.data?.device.id ?? "" }),
      enabled: api.isSuccess,
   })

   const ShowActionByStatus = useCallback(
      ({ children, requiredStatus }: { children: ReactNode; requiredStatus: FixRequestStatus[] }) => {
         if (!api.isSuccess) return null

         if (requiredStatus.includes(api.data.status)) {
            return children
         }
         return null
      },
      [api.data, api.isSuccess],
   )

   function handleScanFinish(result: string) {
      message.destroy("scan-msg")

      if (!api.isSuccess) {
         message.error("Quét ID thiết bị thất bại. Vui lòng thử lại.").then()
         return
      }

      if (!isUUID(result)) {
         message
            .error({
               content: "ID thiết bị không hợp lệ.",
               key: "scan-msg",
            })
            .then()
         return
      }

      if (api.data.device.id !== result) {
         message
            .error({
               content: "ID thiết bị được quét không khớp.",
               key: "scan-msg",
            })
            .then()
         return
      }

      setHasScanned(true)
      message
         .success({
            content: "Quét ID thiết bị thành công.",
            key: "scan-msg",
         })
         .then()
   }

   return (
      <div className="std-layout">
         <RootHeader
            title="Thông tin chi tiết"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            className="std-layout-outer p-4"
         />
         {api.data?.status === FixRequestStatus.APPROVED && (
            <section className="std-layout-outer">
               <Tabs
                  className="main-tabs"
                  type="line"
                  activeKey={tab}
                  onChange={(key) => setTab(key)}
                  items={[
                     {
                        key: "main-tab-request",
                        label: (
                           <div className="flex items-center gap-2">
                              <Tray size={16} />
                              Request
                           </div>
                        ),
                     },
                     {
                        key: "main-tab-tasks",
                        label: (
                           <div className="flex items-center gap-2">
                              <CheckSquareOffset size={16} />
                              Tasks
                           </div>
                        ),
                     },
                  ]}
               />
            </section>
         )}
         {tab === "main-tab-request" && (
            <>
               <section className={cn(api.data?.status !== FixRequestStatus.APPROVED && "mt-layout")}>
                  <ProDescriptions
                     loading={api.isLoading}
                     dataSource={api.data}
                     size="small"
                     className="flex-grow"
                     title={<div className="text-base">Chi tiết yêu cầu</div>}
                     extra={
                        <Tag
                           color={FixRequestStatusTagMapper[String(api.data?.status)].colorInverse}
                           className="mr-0 grid h-full place-items-center px-3"
                        >
                           {FixRequestStatusTagMapper[String(api.data?.status)].text}
                        </Tag>
                     }
                     columns={[
                        {
                           key: "createdAt",
                           title: "Ngày tạo",
                           dataIndex: "createdAt",
                           render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                        },
                        {
                           key: "updatedAt",
                           title: "Cập nhật lần cuối",
                           dataIndex: "updatedAt",
                           render: (_, e) =>
                              e.updatedAt === e.createdAt ? "-" : dayjs(e.updatedAt).format("DD/MM/YYYY - HH:mm"),
                        },
                        {
                           key: "account-name",
                           title: "Báo cáo bởi",
                           render: (_, e) => e.requester?.username ?? "-",
                        },
                        {
                           title: "Ghi chú",
                           dataIndex: ["requester_note"],
                        },
                     ]}
                  />
               </section>
               {api.data?.status === FixRequestStatus.REJECTED && (
                  <section className="mt-3 w-full">
                     <Card
                        title={
                           <div className="flex items-center gap-1">
                              <XCircle size={18} />
                              Lý do từ chối
                           </div>
                        }
                        size="small"
                     >
                        {api.data?.checker_note}
                     </Card>
                  </section>
               )}
               <section className="std-layout-outer mt-6 rounded-lg bg-white py-layout">
                  <h2 className="mb-2 px-layout text-base font-semibold">Chi tiết thiết bị</h2>
                  <DataListView
                     dataSource={api.data?.device}
                     bordered
                     itemClassName="py-2"
                     labelClassName="font-normal text-neutral-500 text-sub-base"
                     valueClassName="text-sub-base"
                     items={[
                        {
                           label: "Mẫu máy",
                           value: (s) => s.machineModel?.name,
                        },
                        {
                           label: "Khu vực",
                           value: (s) => s.area?.name,
                        },
                        {
                           label: "Vị trí (x, y)",
                           value: (s) => (
                              <a className="flex items-center gap-1">
                                 {s.positionX} x {s.positionY}
                                 <MapPin size={16} weight="fill" />
                              </a>
                           ),
                        },
                        {
                           label: "Nhà sản xuất",
                           value: (s) => s.machineModel?.manufacturer,
                        },
                        {
                           label: "Năm sản xuất",
                           value: (s) => s.machineModel?.yearOfProduction,
                        },
                        {
                           label: "Thời hạn bảo hành",
                           value: (s) => s.machineModel?.warrantyTerm,
                        },
                        {
                           label: "Mô tả",
                           value: (s) => s.description,
                        },
                     ]}
                  />
               </section>
               <ShowActionByStatus requiredStatus={[FixRequestStatus.PENDING, FixRequestStatus.APPROVED]}>
                  <IssuesList
                     api={api}
                     device={device}
                     hasScanned={hasScanned}
                     className="my-6"
                     openIssuesSelect={issueDrawerOpen}
                     setOpenIssuesSelect={setIssueDrawerOpen}
                     ref={issueInputRef}
                  />
               </ShowActionByStatus>
               {hasScanned && (
                  <ShowActionByStatus requiredStatus={[FixRequestStatus.PENDING, FixRequestStatus.APPROVED]}>
                     <section className="std-layout-outer sticky bottom-0 left-0 flex w-full items-center justify-center gap-3 bg-white p-layout shadow-fb">
                        <ShowActionByStatus requiredStatus={[FixRequestStatus.PENDING]}>
                           <RejectTaskDrawer
                              afterSuccess={async () => {
                                 await api.refetch()
                              }}
                           >
                              {(handleOpen) => (
                                 <Button
                                    danger={true}
                                    type="primary"
                                    size="large"
                                    onClick={() => handleOpen(params.id)}
                                    icon={<CloseOutlined />}
                                 >
                                    Từ chối
                                 </Button>
                              )}
                           </RejectTaskDrawer>
                        </ShowActionByStatus>
                        {api.data?.issues.length === 0 && (
                           <Button
                              type="primary"
                              size="large"
                              icon={<PlusOutlined />}
                              className="flex-grow"
                              onClick={() => {
                                 setIssueDrawerOpen(true)
                                 issueInputRef.current?.focus()
                              }}
                           >
                              Tạo vấn đề đầu tiên
                           </Button>
                        )}
                        {api.data?.issues.length !== 0 && (
                           <Button
                              type="primary"
                              size="large"
                              icon={<PlusOutlined />}
                              className="flex-grow"
                              onClick={() => router.push(`/head-staff/mobile/requests/${params.id}/task/new`)}
                           >
                              Tạo tác vụ
                           </Button>
                        )}
                     </section>
                  </ShowActionByStatus>
               )}
            </>
         )}
         <ShowActionByStatus requiredStatus={[FixRequestStatus.PENDING, FixRequestStatus.APPROVED]}>
            <ScannerDrawer onScan={handleScanFinish}>
               {(handleOpen) =>
                  !hasScanned && (
                     <section className="std-layout-outer sticky bottom-0 left-0 w-full justify-center bg-white p-layout shadow-fb">
                        <Button size={"large"} className="w-full" type="primary" onClick={handleOpen}>
                           Quét mã QR để tiếp tục
                        </Button>
                     </section>
                  )
               }
            </ScannerDrawer>
         </ShowActionByStatus>
      </div>
   )
}

type FieldType = {
   request: string
   typeError: string
   description: string
   fixType: FixType
}

type IssuesListProps = {
   api: UseQueryResult<FixRequestDto, Error>
   device: UseQueryResult<DeviceDto, Error>
   openIssuesSelect: boolean
   setOpenIssuesSelect: Dispatch<SetStateAction<boolean>>
   hasScanned: boolean
   className?: string
}

const IssuesList = forwardRef<any, IssuesListProps>(function Component(
   { api, device, hasScanned, className, openIssuesSelect, setOpenIssuesSelect },
   ref,
) {
   const { message } = App.useApp()
   const [form] = Form.useForm<FieldType>()

   const [createDrawerOpen, setCreateDrawerOpen] = useState(false)
   const [selectedTypeErrorId, setSelectedTypeErrorId] = useState<undefined | string>()

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
      if (!device.isSuccess || !selectedTypeErrorId) return

      return device.data.machineModel.typeErrors.find((e) => e.id === selectedTypeErrorId)
   }, [device.data, device.isSuccess, selectedTypeErrorId])

   function handleCloseCreateDrawer() {
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
         onSuccess: async () => {
            form.resetFields()
            handleCloseCreateDrawer()
            await api.refetch()
         },
      })
   }

   return (
      <section className={className}>
         <h2 className="mb-2 text-base font-semibold">Báo cáo vấn đề</h2>
         {api.isSuccess ? (
            <>
               <IssueDetailsDrawer
                  refetch={api.refetch}
                  showActions={hasScanned}
                  drawerProps={{
                     placement: "bottom",
                     height: "clamp(100%, max-content, max-content)",
                  }}
               >
                  {(handleOpen) => (
                     <>
                        <List
                           dataSource={api.data?.issues}
                           renderItem={(item) => (
                              <List.Item>
                                 <List.Item.Meta
                                    title={item.typeError.name}
                                    description={
                                       <div className="flex items-center gap-1">
                                          <Tag color={FixTypeTagMapper[String(item.fixType)].colorInverse}>
                                             {FixTypeTagMapper[String(item.fixType)].text}
                                          </Tag>
                                          <span className="truncate">{item.description}</span>
                                       </div>
                                    }
                                 />
                                 <Button
                                    type="link"
                                    onClick={() => device.isSuccess && handleOpen(item.id, device.data.id)}
                                 >
                                    Xem thêm
                                 </Button>
                              </List.Item>
                           )}
                        />
                        {hasScanned && (
                           <Select
                              ref={ref}
                              options={device.data?.machineModel.typeErrors.map((error) => ({
                                 label: error.name,
                                 value: error.id,
                              }))}
                              className="mt-3 w-full"
                              showSearch
                              variant="outlined"
                              size="large"
                              placeholder="+ Tạo vấn đề mới"
                              value={selectedTypeErrorId}
                              onChange={(value) => handleSelectIssue(value)}
                              open={openIssuesSelect}
                              onDropdownVisibleChange={(open) => setOpenIssuesSelect(open)}
                           />
                        )}
                     </>
                  )}
               </IssueDetailsDrawer>
            </>
         ) : (
            <>{api.isPending && <Skeleton.Button />}</>
         )}
         <Drawer
            open={createDrawerOpen}
            onClose={handleCloseCreateDrawer}
            title="Tạo vấn đề"
            placement="bottom"
            height="max-content"
         >
            <ProDescriptions
               dataSource={selectedTypeError}
               size="small"
               className="mb-3"
               title={<span className="text-lg">Chi tiết lỗi</span>}
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
                     title: "Thời lượng",
                     dataIndex: ["duration"],
                  },
                  {
                     title: "Mô tả",
                     dataIndex: ["description"],
                  },
               ]}
            />
            <Form<FieldType>
               form={form}
               onFinish={(values) => {
                  if (!selectedTypeErrorId || !api.isSuccess) return
                  handleCreateIssue({
                     ...values,
                     request: api.data.id,
                     typeError: selectedTypeErrorId,
                  })
               }}
               className="flex-grow"
               layout="vertical"
            >
               <Form.Item
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
                  rules={[{ required: true }]}
                  allowClear
                  fieldProps={{
                     showCount: true,
                     maxLength: 300,
                  }}
               />
               <Button className="w-full" type="primary" size="large" onClick={form.submit}>
                  Tạp vấn đề
               </Button>
            </Form>
         </Drawer>
      </section>
   )
})
