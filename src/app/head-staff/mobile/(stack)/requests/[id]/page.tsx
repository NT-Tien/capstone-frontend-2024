"use client"

import RootHeader from "@/common/components/RootHeader"
import { useMutation, useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { ProDescriptions } from "@ant-design/pro-components"
import { CloseOutlined, DeleteOutlined, LeftOutlined, PlusOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { App, Button, Card, Collapse, Descriptions, Drawer, Empty, List, Tabs, Tag, Typography } from "antd"
import { FixRequestStatus, FixRequestStatusTagMapper } from "@/common/enum/issue-request-status.enum"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import RejectTaskDrawer from "@/app/head-staff/_components/RejectTask.drawer"
import { useTranslation } from "react-i18next"
import React, { ReactNode, useCallback, useState } from "react"
import { MapPin, NotePencil, Pill, Tray, XCircle } from "@phosphor-icons/react"
import DeviceDetailsCard from "@/common/components/DeviceDetailsCard"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { FixType } from "@/common/enum/fix-type.enum"
import SelectSparePartDrawer from "@/app/head-staff/_components/SelectSparePart.drawer"
import CreateIssueDrawer from "@/app/head-staff/_components/CreateIssue.drawer"
import { useIssueRequestStatusTranslation } from "@/common/enum/use-issue-request-status-translation"
import HeadStaff_SparePart_Create from "@/app/head-staff/_api/spare-part/create.api"
import HeadStaff_SparePart_Delete from "@/app/head-staff/_api/spare-part/delete.api"
import HeadStaff_Issue_Delete from "@/app/head-staff/_api/issue/delete.api"
import { cn } from "@/common/util/cn.util"
import DeviceScanner from "../../../../_components/DeviceScanner"
import DataListView from "@/common/components/DataListView"

export default function RequestDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { t } = useTranslation()
   const [tab, setTab] = useState<string>("main-tab-request")
   const { getFixTypeTranslation } = useIssueRequestStatusTranslation()
   const { message } = App.useApp()

   const [scanDrawerVisible, setScanDrawerVisible] = useState<boolean>(false)
   const [scanResult, setScanResult] = useState<boolean | null>(null)
   const [scanButtonVisible, setScanButtonVisible] = useState<boolean>(true)
   const [scanCompleted, setScanCompleted] = useState<boolean>(false)
   const [scanningPaused, setScanningPaused] = useState<boolean>(false)

   const api = useQuery({
      queryKey: qk.issueRequests.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
   })

   const mutate_addSparePart = useMutation({
      mutationFn: HeadStaff_SparePart_Create,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "creating-spare-part",
            content: "Adding Spare Part...",
         })
      },
      onError: async () => {
         message.error("Failed to add spare part")
      },
      onSuccess: async () => {
         message.success("Spare part added")
         await api.refetch()
      },
      onSettled: () => {
         message.destroy("creating-spare-part")
      },
   })

   const mutate_deleteIssue = useMutation({
      mutationFn: HeadStaff_Issue_Delete,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "remove",
            content: "Removing Issue...",
         })
      },
      onError: async () => {
         message.error("Failed to remove issue")
      },
      onSuccess: async () => {
         message.success("Issue removed")
         await api.refetch()
      },
      onSettled: () => {
         message.destroy("remove")
      },
   })

   const mutate_deleteSparePart = useMutation({
      mutationFn: HeadStaff_SparePart_Delete,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "remove-spare-part",
            content: "Removing Spare Part...",
         })
      },
      onError: async () => {
         message.error("Failed to remove spare part")
      },
      onSuccess: async () => {
         message.success("Spare part removed")
         await api.refetch()
      },
      onSettled: () => {
         message.destroy("remove-spare-part")
      },
   })

   const ShowAction = useCallback(
      ({ children }: { children: ReactNode }) => {
         if (api.data?.status === FixRequestStatus.PENDING) {
            return children
         }
         return null
      },
      [api.data],
   )
   const handleScanClose = () => {
      setScanDrawerVisible(false)
      setScanningPaused(true)
   }

   const handleScanResult = (deviceId: string) => {
      if (scanningPaused) return
      if (api.isSuccess && api.data.device.id === deviceId) {
         setScanResult(true)
         setScanDrawerVisible(false)
         setScanButtonVisible(false)
         setScanCompleted(true)
      } else {
         message.error("Scanned device ID does not match request details.")
      }
   }

   const handleOpenScanDrawer = () => {
      setScanningPaused(false)
      setScanDrawerVisible(true)
   }

   return (
      <div className="std-layout pb-24">
         <RootHeader
            title="Request Details"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            className="std-layout-outer p-4"
         />
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
                     key: "main-tab-issues",
                     label: (
                        <div className="flex items-center gap-2">
                           <Pill size={16} />
                           Issues
                        </div>
                     ),
                     children: (
                        <div>
                           {api.data?.issues.length !== 0 ? (
                              <Collapse
                                 expandIconPosition="end"
                                 items={api.data?.issues.map((item: FixRequestIssueDto) => ({
                                    key: item.id,
                                    label: (
                                       <div>
                                          <Tag color={FixRequestStatusTagMapper[String(item.status)].colorInverse}>
                                             {FixRequestStatusTagMapper[String(item.status)].text}
                                          </Tag>
                                          <Typography.Text className="w-40">{item.typeError.name}</Typography.Text>
                                       </div>
                                    ),
                                    children: (
                                       <div>
                                          <Descriptions
                                             size="small"
                                             items={[
                                                {
                                                   label: "Description",
                                                   children: item.description,
                                                },
                                                {
                                                   label: "Fix Type",
                                                   children: (
                                                      <Tag color={item.fixType === FixType.REPAIR ? "red" : "blue"}>
                                                         {getFixTypeTranslation(item.fixType)}
                                                      </Tag>
                                                   ),
                                                },
                                             ]}
                                          />

                                          <div className="w-full">
                                             {item.issueSpareParts.length === 0 ? (
                                                <Card className="my-3">
                                                   <Empty
                                                      description={
                                                         <span>
                                                            This issue has{" "}
                                                            <strong className="font-bold underline">
                                                               no spare parts
                                                            </strong>{" "}
                                                            assigned
                                                         </span>
                                                      }
                                                      className="rounded-lg py-6"
                                                   />
                                                </Card>
                                             ) : (
                                                <List
                                                   className={"w-full"}
                                                   dataSource={item.issueSpareParts}
                                                   itemLayout={"horizontal"}
                                                   size={"small"}
                                                   renderItem={(sp) => (
                                                      <List.Item
                                                         itemID={sp.id}
                                                         key={sp.id}
                                                         extra={
                                                            <ShowAction>
                                                               <Button
                                                                  danger
                                                                  type="text"
                                                                  size={"small"}
                                                                  icon={<DeleteOutlined />}
                                                                  onClick={() => {
                                                                     mutate_deleteSparePart.mutate({
                                                                        id: sp.id,
                                                                     })
                                                                  }}
                                                               />
                                                            </ShowAction>
                                                         }
                                                      >
                                                         <List.Item.Meta
                                                            title={sp.sparePart.name}
                                                            description={`${t("Qty")}: ${sp.quantity}`}
                                                         ></List.Item.Meta>
                                                      </List.Item>
                                                   )}
                                                />
                                             )}
                                          </div>
                                       </div>
                                    ),
                                 }))}
                              />
                           ) : (
                              <Card className="py-layout">
                                 <Empty description="This request has no issues" />
                              </Card>
                           )}
                           <div className="fixed bottom-0 left-0 w-full bg-white p-layout shadow-fb">
                              {api.isSuccess && (
                                 <CreateIssueDrawer
                                    onSuccess={async () => {
                                       await api.refetch()
                                    }}
                                 >
                                    {(handleOpen) => (
                                       <Button
                                          type="primary"
                                          size="large"
                                          className={cn("w-full")}
                                          onClick={() => handleOpen(params.id)}
                                          disabled={!scanCompleted}
                                          icon={<PlusOutlined />}
                                       >
                                          Add Issue
                                       </Button>
                                    )}
                                 </CreateIssueDrawer>
                              )}
                           </div>
                        </div>
                     ),
                  },
                  ...(api.data?.status === FixRequestStatus.APPROVED
                     ? [
                          {
                             key: "main-tab-tasks",
                             label: "Tasks",
                             children: <div></div>,
                          },
                       ]
                     : []),
               ]}
            />
         </section>
         {tab === "main-tab-request" && (
            <>
               <section className="mt-layout-half">
                  <ProDescriptions
                     loading={api.isLoading}
                     dataSource={api.data}
                     size="small"
                     className="flex-grow"
                     title={<div className="text-base">Request Details</div>}
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
                           title: t("Created"),
                           dataIndex: "createdAt",
                           render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                        },
                        {
                           key: "updatedAt",
                           title: t("LastUpdated"),
                           dataIndex: "updatedAt",
                           render: (_, e) =>
                              e.updatedAt === e.createdAt ? "-" : dayjs(e.updatedAt).format("DD/MM/YYYY - HH:mm"),
                        },
                        {
                           key: "account-name",
                           title: t("ReportedBy"),
                           render: (_, e) => e.requester?.username ?? "-",
                        },
                        {
                           title: "Requester Note",
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
                              Rejection Reason
                           </div>
                        }
                        size="small"
                     >
                        {api.data?.checker_note}
                     </Card>
                  </section>
               )}
               <section className="std-layout-outer mt-6 rounded-lg bg-white py-layout">
                  <h2 className="mb-2 px-layout text-base font-semibold">Device Details</h2>
                  <DataListView
                     dataSource={api.data?.device}
                     bordered
                     itemClassName="py-2"
                     labelClassName="font-normal text-neutral-500 text-sub-base"
                     valueClassName="text-sub-base"
                     items={[
                        {
                           label: "Machine Model",
                           value: (s) => s.machineModel?.name,
                        },
                        {
                           label: "Area",
                           value: (s) => s.area?.name,
                        },
                        {
                           label: "Position (x, y)",
                           value: (s) => (
                              <a className="flex items-center gap-1">
                                 {s.positionX} x {s.positionY}
                                 <MapPin size={16} weight="fill" />
                              </a>
                           ),
                        },
                        {
                           label: "Manufacturer",
                           value: (s) => s.machineModel?.manufacturer,
                        },
                        {
                           label: "Year of Production",
                           value: (s) => s.machineModel?.yearOfProduction,
                        },
                        {
                           label: "Warranty Term",
                           value: (s) => s.machineModel?.warrantyTerm,
                        },
                        {
                           label: "Description",
                           value: (s) => s.description,
                        },
                     ]}
                  />
               </section>
               <section className="py-layout">
                  {scanResult && (
                     <ShowAction>
                        <Typography.Title level={5}>Actions</Typography.Title>
                        <div className="flex flex-col gap-2">
                           <RejectTaskDrawer>
                              {(handleOpen) => (
                                 <Button
                                    danger={true}
                                    type="primary"
                                    size="large"
                                    className="w-full"
                                    onClick={() => handleOpen(params.id)}
                                    icon={<CloseOutlined />}
                                 >
                                    Reject Request
                                 </Button>
                              )}
                           </RejectTaskDrawer>
                        </div>
                     </ShowAction>
                  )}
               </section>
            </>
         )}
         {scanButtonVisible && (
            <>
               <section className="fixed bottom-0 left-0 w-full justify-center bg-white p-4">
                  <Button size={"large"} className="w-full" type="primary" onClick={handleOpenScanDrawer}>
                     Scan QR to Continue
                  </Button>
               </section>
               <Drawer
                  title="Scan QR"
                  placement="bottom"
                  height="max-content"
                  onClose={handleScanClose}
                  open={scanDrawerVisible}
               >
                  <DeviceScanner onScanResult={handleScanResult} onClose={handleScanClose} open={!scanDrawerVisible} />
               </Drawer>
            </>
         )}
      </div>
   )
}
