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
                     split={false}
                     bordered={false}
                     dataSource={api_requestHistory.data?.requests}
                     loading={api_requestHistory.isPending}
                     size={"small"}
                     header={
                        <div className={"text-sm"}>
                           Tìm thấy {api_requestHistory.data?.requests.length} yêu cầu sửa chữa
                        </div>
                     }
                     renderItem={(item) => (
                        <IsCurrentRequest id={item.id}>
                           <Card
                              bordered={true}
                              hoverable={item.id !== currentRequestId}
                              className={cn("mb-2 w-full", item.id === currentRequestId && "opacity-75")}
                              classNames={{
                                 body: "p-0",
                              }}
                              onClick={() => {
                                 if (item.id === currentRequestId) return

                                 handleClose()
                                 setTimeout(() => {
                                    router.push(`/head-staff/mobile/requests/${item.id}?fromHistory=true`)
                                 }, 200)
                              }}
                           >
                              <List.Item
                                 actions={
                                    item.id === currentRequestId
                                       ? []
                                       : [<Button key={"view"} size="large" type={"text"} icon={<RightOutlined />} />]
                                 }
                                 className="pr-0"
                              >
                                 <List.Item.Meta
                                    title={<h3 className="text-sub-base">{item.requester_note}</h3>}
                                    description={
                                       <div>
                                          <Tag color={FixRequest_StatusMapper(item).colorInverse}>
                                             {FixRequest_StatusMapper(item).text}
                                          </Tag>
                                          <Tag>
                                             <UserOutlined className="mr-1" />
                                             {item.requester?.username}
                                          </Tag>
                                          <Tag>
                                             <CalendarOutlined className="mr-1" />
                                             {dayjs(item.createdAt).format("DD/MM/YYYY")}
                                          </Tag>
                                       </div>
                                    }
                                 />
                              </List.Item>
                           </Card>
                        </IsCurrentRequest>
                     )}
                  />
               ))}
         </Drawer>
      </>
   )
}
