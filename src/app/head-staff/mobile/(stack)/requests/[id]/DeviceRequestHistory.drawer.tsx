import { ReactNode, useState } from "react"
import useModalControls from "@/common/hooks/useModalControls"
import { Button, Card, Drawer, Empty, List, Result, Tag } from "antd"
import { useQuery } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Device_OneByIdWithHistory from "@/app/head-staff/_api/device/one-byIdWithHistory.api"
import { CalendarOutlined, RightOutlined, UserOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"

export default function DeviceRequestHistoryDrawer({
   children,
   ...props
}: {
   children: (handleOpen: (deviceId?: string) => void) => ReactNode
}) {
   const router = useRouter()

   const [deviceId, setDeviceId] = useState<string | undefined>()
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (deviceId?: string) => {
         setDeviceId(deviceId)
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

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} title="Lịch sử yêu cầu" placement="bottom" height="100%">
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
                        <Card
                           bordered={true}
                           hoverable
                           className="mb-2 w-full"
                           classNames={{
                              body: "p-0",
                           }}
                           onClick={() => {
                              handleClose()
                              setTimeout(() => {
                                 router.push(`/head-staff/mobile/requests/${item.id}`)
                              }, 200)
                           }}
                        >
                           <List.Item
                              actions={[<Button key={"view"} size="large" type={"text"} icon={<RightOutlined />} />]}
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
                     )}
                  />
               ))}
         </Drawer>
      </>
   )
}
