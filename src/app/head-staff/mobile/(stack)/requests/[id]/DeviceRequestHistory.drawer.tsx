import HeadStaff_Device_OneByIdWithHistory from "@/app/head-staff/_api/device/one-byIdWithHistory.api"
import headstaff_qk from "@/app/head-staff/_api/qk"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"
import useModalControls from "@/common/hooks/useModalControls"
import { cn } from "@/common/util/cn.util"
import { useQuery } from "@tanstack/react-query"
import { Card, Drawer, Empty, List, Result, Segmented, Tag } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { ReactNode, useMemo, useState } from "react"
import isApproved from "./approved/is-approved.util"

type Tabs = "fix" | "warranty"

export default function DeviceRequestHistoryDrawer({
   children,
   ...props
}: {
   children: (handleOpen: (deviceId: string, currentRequestId: string) => void) => ReactNode
}) {
   const [deviceId, setDeviceId] = useState<string | undefined>()
   const [currentRequestId, setCurrentRequestId] = useState<string | undefined>()
   const [currentTab, setCurrentTab] = useState<Tabs>("fix")

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

   const requests = useMemo(() => {
      if (!api_requestHistory.isSuccess) return

      let fixed: FixRequestDto[] = [],
         warranty: FixRequestDto[] = []
      api_requestHistory.data.requests.forEach((request) => {
         if (request.id === currentRequestId) {
            return
         }

         if (request.is_warranty) {
            warranty.push(request)
            return
         }

         if (!request.is_warranty) {
            fixed.push(request)
            return
         }
      })

      return {
         fixed,
         warranty,
      }
   }, [api_requestHistory.data?.requests, api_requestHistory.isSuccess, currentRequestId])

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
               body: "pt-layout",
            }}
         >
            {api_requestHistory.isPending && <Card loading />}
            {api_requestHistory.isError && (
               <Card>
                  <Result status="error" title="Có lỗi đã xảy ra" subTitle={api_requestHistory.error.message} />
               </Card>
            )}
            {api_requestHistory.isSuccess && (
               <>
                  <Segmented
                     options={[
                        {
                           label: "Sửa chữa",
                           value: "fix",
                        },
                        {
                           label: "Bảo hành",
                           value: "warranty",
                        },
                     ]}
                     value={currentTab}
                     onChange={(value) => setCurrentTab(value as "fix" | "warranty")}
                     size="large"
                     block
                  />
                  {currentTab === "fix" && <RenderList requests={requests?.fixed} currentTab="fix" />}
                  {currentTab === "warranty" && <RenderList requests={requests?.warranty} currentTab="warranty" />}
               </>
            )}
         </Drawer>
      </>
   )
}

type RenderListProps = {
   requests?: FixRequestDto[]
   currentTab: Tabs
}

function RenderList(props: RenderListProps) {
   const router = useRouter()

   if (props.requests?.length === 0) {
      return (
         <Card className="mt-3">
            <Empty
               description={`Thiết bị không có yêu cầu ${props.currentTab === "fix" ? "Sửa chữa" : props.currentTab === "warranty" ? "Bảo hành" : ""} nào`}
            />
         </Card>
      )
   }

   return (
      <>
         <List
            rootClassName={"list-no-padding"}
            split
            bordered={false}
            dataSource={props.requests}
            header={
               <div className={"text-sm"}>
                  Tìm thấy {props.requests?.length} yêu cầu{" "}
                  {props.currentTab === "fix" ? "Sửa chữa" : props.currentTab === "warranty" ? "Bảo hành" : "-"}
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
      </>
   )
}

/*
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
*/
