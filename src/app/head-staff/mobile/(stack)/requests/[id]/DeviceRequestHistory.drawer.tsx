import { ReactNode, useState } from "react"
import useModalControls from "@/common/hooks/useModalControls"
import { Badge, Button, Card, Drawer, Empty, List, Result, Tag } from "antd"
import { useQuery } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Device_OneByIdWithHistory from "@/app/head-staff/_api/device/one-byIdWithHistory.api"
import { CalendarOutlined, RightOutlined, UserOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"
import { cn } from "@/common/util/cn.util"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import isApproved from "./approved/is-approved.util"

export default function DeviceRequestHistoryDrawer({
   children,
   ...props
}: {
   children: (handleOpen: (deviceId: string, currentRequestId: string) => void) => ReactNode
}) {
   const router = useRouter()

   const [deviceId, setDeviceId] = useState<string | undefined>()
   const [currentRequestId, setCurrentRequestId] = useState<string | undefined>()
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (deviceId: string, currentRequestId: string) => {
         setDeviceId(deviceId)
         setCurrentRequestId(currentRequestId)
      },
      onClose: () => {
         setDeviceId(undefined)
      },
   })

   // const api_device = useQuery({
   //    queryKey: headstaff_qk.device.byId(deviceId ?? ""),
   //    queryFn: () => HeadStaff_Device_OneById({ id: deviceId ?? "" }),
   //    enabled: !!deviceId,
   // })

   const api_requestHistory = useQuery({
      queryKey: headstaff_qk.device.byIdWithHistory(deviceId ?? ""),
      queryFn: () => HeadStaff_Device_OneByIdWithHistory({ id: deviceId ?? "" }),
      enabled: !!deviceId,
      select(data) {
         return {
            ...data,
            requests: data.requests.filter((request) => request.id !== currentRequestId),
         }
      },
   })

   function IsCurrentRequest({ children, ...props }: { children: ReactNode; id: string }) {
      if (props.id !== currentRequestId) {
         return children
      } else {
         return <Badge.Ribbon text={"Đang xem"}>{children}</Badge.Ribbon>
      }
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title="Lịch sử yêu cầu"
            placement="bottom"
            height="100%"
            classNames={{
               body: "pt-2",
            }}
         >
            {api_requestHistory.isPending && <Card loading />}
            {api_requestHistory.isError && (
               <Card>
                  <Result status="error" title="Có lỗi đã xảy ra" subTitle={api_requestHistory.error.message} />
               </Card>
            )}
            {api_requestHistory.isSuccess &&
               (api_requestHistory.data.requests.length === 0 ? (
                  <Card>
                     <Empty description="Thiết bị không có yêu cầu sửa chữa nào" />
                  </Card>
               ) : (
                  <List
                     rootClassName={"list-no-padding"}
                     split
                     bordered={false}
                     dataSource={api_requestHistory.data?.requests}
                     loading={api_requestHistory.isPending}
                     header={
                        <div className={"text-sm"}>
                           Tìm thấy {api_requestHistory.data?.requests.length} yêu cầu sửa chữa
                        </div>
                     }
                     renderItem={(item, index) => (
                        <List.Item
                           className={cn(index === 0 && "mt-1")}
                           onClick={() => {
                              if (isApproved(item.status)) {
                                 router.push(`/head-staff/mobile/requests/${item.id}/approved?viewingHistory=true`)
                              } else {
                                 router.push(`/head-staff/mobile/requests/${item.id}?viewingHistory=true`)
                              }
                           }}
                           extra={
                              <div className="flex flex-col justify-between gap-1">
                                 <div className="text-right">
                                    <Tag className="mr-0" color={FixRequest_StatusMapper(item).colorInverse}>
                                       {FixRequest_StatusMapper(item).text}
                                    </Tag>
                                 </div>
                                 <span className="text-right text-neutral-500">
                                    {dayjs(item.updatedAt).add(7, "hours").format("DD/MM/YYYY")}
                                 </span>
                              </div>
                           }
                        >
                           <List.Item.Meta
                              title={item.requester.username}
                              description={<span className="line-clamp-1">{item.requester_note}</span>}
                           ></List.Item.Meta>
                        </List.Item>
                     )}
                  />
               ))}
         </Drawer>
      </>
   )
}
