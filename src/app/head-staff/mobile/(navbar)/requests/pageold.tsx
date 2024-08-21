// "use client"

// import headstaff_qk from "@/app/head-staff/_api/qk"
// import HeadStaff_Request_All30Days from "@/app/head-staff/_api/request/all30Days.api"
// import ReportCard from "@/common/components/ReportCard"
// import RootHeader from "@/common/components/RootHeader"
// import ScrollableTabs from "@/common/components/ScrollableTabs"
// import {
//    FixRequest_StatusData,
//    FixRequestStatuses
// } from "@/common/dto/status/FixRequest.status"
// import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
// import { TaskStatus } from "@/common/enum/task-status.enum"
// import { useQuery } from "@tanstack/react-query"
// import { Button, Card, Empty, Result, Skeleton } from "antd"
// import dayjs from "dayjs"
// import { useRouter } from "next/navigation"
// import { useMemo, useState } from "react"

// export default function ReportsPage() {
//    const [tab, setTab] = useState<FixRequestStatus>(FixRequestStatus.PENDING)

//    return (
//       <div className="std-layout">
//          <RootHeader title="Yêu cầu" className="std-layout-outer p-4" />
//          <ScrollableTabs
//             className="std-layout-outer sticky left-0 top-0 z-10"
//             classNames={{
//                content: "mt-layout",
//             }}
//             tab={tab}
//             onTabChange={setTab}
//             items={(
//                ["pending", "approved", "in_progress", "head_confirm", "closed", "rejected"] as FixRequestStatuses[]
//             ).map((item) => ({
//                key: FixRequest_StatusData(item).statusEnum,
//                title: FixRequest_StatusData(item).text,
//                icon: FixRequest_StatusData(item, {
//                   phosphor: {
//                      size: 16,
//                   },
//                }).icon,
//             }))}
//          />
//          <ReportsTab status={tab} />
//       </div>
//    )
// }

// type ReportsTabProps = {
//    status: FixRequestStatus
// }

// function ReportsTab(props: ReportsTabProps) {
//    const router = useRouter()

//    const results = useQuery({
//       queryKey: headstaff_qk.request.all({
//          page: String(1),
//          limit: String(50),
//          status: props.status,
//       }),
//       queryFn: () =>
//          HeadStaff_Request_All30Days({
//             page: 1,
//             limit: 50,
//             status: props.status,
//          }),
//    })

//    const sortOrder = useMemo(() => {
//       switch (props.status) {
//          case FixRequestStatus.PENDING:
//             return "Sắp xếp theo ngày tạo (cũ nhất - mới nhất)"
//          case FixRequestStatus.APPROVED:
//          case FixRequestStatus.REJECTED:
//          case FixRequestStatus.IN_PROGRESS:
//          case FixRequestStatus.HEAD_CONFIRM:
//          case FixRequestStatus.CLOSED:
//          default:
//             return "Sắp xếp theo ngày chỉnh sửa (mới nhất - cũ nhất)"
//       }
//    }, [props.status])

//    return (
//       <div className="mb-layout grid grid-cols-1 gap-2">
//          <div className="text-gray-500">
//             {sortOrder}
//          </div>
//          {results.isSuccess ? (
//             <>
//                {results.data.list.length !== 0 ? (
//                   results.data.list.map((req, index) => (
//                      <ReportCard
//                         dto={req}
//                         key={req.id}
//                         id={req.id}
//                         positionX={req.device.positionX}
//                         positionY={req.device.positionY}
//                         area={req.device.area.name}
//                         machineModelName={req.device?.machineModel?.name ?? "Test Machine"}
//                         createdDate={dayjs(req.status === FixRequestStatus.PENDING ? req.createdAt : req.updatedAt)
//                            .add(7, "hours")
//                            .locale("vi")
//                            .format("DD/MM/YY - HH:mm")}
//                         onClick={(id: string) => router.push(`/head-staff/mobile/requests/${id}`)}
//                         index={index}
//                         new={!req.is_seen}
//                         hasCheck={!!req.tasks.find((task) => task.status === TaskStatus.HEAD_STAFF_CONFIRM)}
//                      />
//                   ))
//                ) : (
//                   <div className="grid h-full place-content-center">
//                      <Empty description={"Hệ thống không tìm thấy yêu cầu nào"} image={Empty.PRESENTED_IMAGE_SIMPLE} />
//                   </div>
//                )}
//             </>
//          ) : (
//             <>{results.isPending && (
//                <div className="grid grid-cols-1 gap-2">
//                   <Skeleton paragraph />
//                   <Skeleton paragraph />
//                   <Skeleton paragraph />
//                   <Skeleton paragraph />
//                   <Skeleton paragraph />
//                </div>
//             )}
//             {results.isError && (
//                   <Card size="small">
//                      <Result
//                         status="error"
//                         title="Đã xảy ra lỗi"
//                         subTitle="Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại."
//                         extra={<Button type="primary" onClick={() => results.refetch()}>Thử lại</Button>}
//                      />
//                   </Card>
//                )}</>
//          )}
//       </div>
//    )
// }
