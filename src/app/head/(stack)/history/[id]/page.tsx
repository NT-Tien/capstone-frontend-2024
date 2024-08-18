"use client"

import Head_Request_All from "@/app/head/_api/request/all.api"
import DataListView from "@/common/components/DataListView"
import RootHeader from "@/common/components/RootHeader"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { NotFoundError } from "@/common/error/not-found.error"
import qk from "@/common/querykeys"
import { LeftOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { MapPin, XCircle } from "@phosphor-icons/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Button, Card, Modal, Progress, Steps, Tag } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { FixRequest_StatusData, FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"
import Head_Request_UpdateClose from "@/app/head/_api/request/update-close.api"
import FeedbackDrawer from "@/app/head/(stack)/history/[id]/Feedback.drawer"
import { useMemo, useState } from "react"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"

export default function HistoryDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const [openCancelWarning, setOpenCancelWarning] = useState(false)
   const api = useQuery({
      queryKey: qk.issueRequests.allRaw(),
      queryFn: () => Head_Request_All(),
      select: (data) => {
         const issue = data.find((d) => d.id === params.id)
         if (!issue) throw new NotFoundError("Issue")
         return issue
      },
   })

   const percentFinished = useMemo(() => {
      if (!api.isSuccess) return 0
      return Math.floor(
         (api.data.issues?.reduce((acc, prev) => {
            return acc + (prev.status === IssueStatusEnum.RESOLVED ? 1 : 0)
         }, 0) *
            100) /
            api.data.issues?.length,
      )
   }, [api.data?.issues, api.isSuccess])

   const handleCancel = () => {
      setOpenCancelWarning(true)
   }

   return (
      <div className="std-layout">
         <RootHeader
            title="Thông tin báo cáo"
            className="std-layout-outer p-4"
            icon={<LeftOutlined />}
            onIconClick={() => router.replace("/head/history")}
            buttonProps={{
               type: "text",
            }}
         />
         <ProDescriptions
            className="mt-layout"
            labelStyle={{
               fontSize: "1rem",
            }}
            contentStyle={{
               fontSize: "1rem",
            }}
            title={<span className="text-lg">{"Cụ thể"}</span>}
            extra={<Tag color={FixRequest_StatusMapper(api.data).color}>{FixRequest_StatusMapper(api.data).text}</Tag>}
            dataSource={api.data}
            loading={api.isPending}
            size="small"
            columns={[
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("YYYY-MM-DD HH:mm:ss"),
               },
               {
                  title: "Cập nhật lần cuối",
                  dataIndex: "updatedAt",
                  render: (_, e) =>
                     e.createdAt === e.updatedAt
                        ? "-"
                        : dayjs(e.updatedAt).add(7, "hours").format("YYYY-MM-DD HH:mm:ss"),
               },
               {
                  title: "Báo cáo bởi",
                  dataIndex: ["requester", "username"],
               },
               {
                  title: "Ghi chú",
                  dataIndex: "requester_note",
               },
            ]}
         />
         <section className="mt-3">
            <Card size="small" loading={api.isPending}>
               <Steps
                  size="small"
                  direction="vertical"
                  current={FixRequest_StatusMapper(api.data).index}
                  status={api.data?.status === FixRequestStatus.REJECTED ? "error" : "process"}
                  className="std-steps"
                  items={[
                     {
                        title: (
                           <div className="flex items-center">
                              <span>{FixRequest_StatusData("pending").text}</span>
                              <Button danger onClick={handleCancel} className="ml-5">
                                 Hủy báo cáo
                              </Button>
                           </div>
                        ),
                        description:
                           api.data?.status === FixRequest_StatusData("pending").statusEnum
                              ? FixRequest_StatusData("pending").description
                              : null,
                        className: "text-base",
                     },
                     // {
                     //    title: FixRequest_StatusData("checked").text,
                     //    description:
                     //       api.data?.status === FixRequest_StatusData("checked").statusEnum
                     //          ? FixRequest_StatusData("checked").description
                     //          : null,
                     //    className: "text-base",
                     // },
                     ...(api.isSuccess
                        ? !FixRequest_StatusData("rejected").conditionFn(api.data)
                           ? [
                                {
                                   title: FixRequest_StatusData("approved").text,
                                   description:
                                      api.data?.status === FixRequest_StatusData("approved").statusEnum
                                         ? FixRequest_StatusData("approved").description
                                         : null,
                                   className: "text-base",
                                },
                                {
                                   title: FixRequest_StatusData("in_progress").text,
                                   description:
                                      api.data?.status === FixRequest_StatusData("in_progress").statusEnum ? (
                                         <div>
                                            {FixRequest_StatusData("in_progress").description}
                                            <Progress percent={percentFinished} />
                                         </div>
                                      ) : null,
                                   className: "text-base",
                                },
                                {
                                   title: FixRequest_StatusData("head_confirm").text,
                                   description:
                                      api.data?.status === FixRequest_StatusData("head_confirm").statusEnum ? (
                                         <div>
                                            {FixRequest_StatusData("head_confirm").description}
                                            {api.data?.status === FixRequestStatus.HEAD_CONFIRM && (
                                               <FeedbackDrawer onSuccess={() => api.refetch()}>
                                                  {(handleOpen) => (
                                                     <Button
                                                        type="primary"
                                                        className="mt-1"
                                                        onClick={() => handleOpen(params.id)}
                                                     >
                                                        Xác nhận
                                                     </Button>
                                                  )}
                                               </FeedbackDrawer>
                                            )}
                                         </div>
                                      ) : null,
                                   className: "text-base",
                                },
                                {
                                   title: FixRequest_StatusData("closed").text,
                                   description:
                                      api.data?.status === FixRequest_StatusData("closed").statusEnum
                                         ? FixRequest_StatusData("closed").description
                                         : null,
                                   className: "text-base",
                                },
                             ]
                           : [
                                {
                                   title: FixRequest_StatusData("rejected").text,
                                   description:
                                      api.data?.status === FixRequest_StatusData("rejected").statusEnum
                                         ? FixRequest_StatusData("rejected").description
                                         : null,
                                   className: "text-base",
                                },
                             ]
                        : []),
                  ]}
               />
            </Card>
         </section>
         {api.data?.status === FixRequestStatus.REJECTED && (
            <section className="mt-3 w-full">
               <Card
                  title={
                     <div className="flex items-center gap-1">
                        <XCircle size={18} />
                        Lý do
                     </div>
                  }
                  size="small"
               >
                  {api.data?.checker_note}
               </Card>
            </section>
         )}
         <section className="std-layout-outer mt-6 bg-white py-layout">
            <h2 className="mb-2 px-layout text-lg font-semibold">Chi tiết thiết bị</h2>
            <DataListView
               dataSource={api.data?.device}
               bordered
               itemClassName="py-2"
               labelClassName="font-normal text-neutral-500 text-base"
               valueClassName="text-base"
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
                     label: "Mô tả",
                     value: (s) => s.description,
                  },
               ]}
            />
         </section>
         <Modal
            open={openCancelWarning}
            onCancel={() => setOpenCancelWarning(false)}
            title="Lưu ý"
            okText="Hủy"
            cancelText="Quay lại"
         >
            <Card>Bạn có chắc chắn muốn hủy báo cáo này?</Card>
         </Modal>
      </div>
   )
}
