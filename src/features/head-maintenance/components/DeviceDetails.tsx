// import DataListView from "@/components/DataListView"
// import dayjs from "dayjs"
// import Tag from "antd/es/tag"
// import { MapPin } from "@phosphor-icons/react"
// import List from "antd/es/list"
// import { cn } from "@/lib/utils/cn.util"
// import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
// import Device_ViewRequestHistoryDrawer from "@/features/head-maintenance/components/overlays/Device_ViewRequestHistory.drawer"
// import Button from "antd/es/button"
// import Card from "antd/es/card"
// import Spin from "antd/es/spin"
// import Result from "antd/es/result"
// import { UseQueryResult } from "@tanstack/react-query"
// import { DeviceDto } from "@/lib/domain/Device/Device.dto"
// import head_maintenance_queries from "@/features/head-maintenance/queries"
// import { useMemo } from "react"
//
// type Props = {
//    id: string
//    api_device: UseQueryResult<DeviceDto, Error>
// }
//
// function DeviceDetails(props: Props) {
//    const api_deviceRequestHistory = head_maintenance_queries.device.all_requestHistory(
//       {
//          id: props.api_device.data?.id ?? "",
//       },
//       {
//          enabled: props.api_device.isSuccess,
//       },
//    )
//
//    const requestHistory = useMemo(() => {
//       return api_deviceRequestHistory.data?.requests.filter((req) => req.id !== props.id)
//    }, [api_deviceRequestHistory.data?.requests, props.id])
//
//    return (
//       <div className="mt-layout-half rounded-lg">
//          <DataListView<DeviceDto>
//             bordered
//             dataSource={props.api_device.data as DeviceDto}
//             itemClassName="py-2"
//             labelClassName="font-normal text-neutral-400 text-[14px]"
//             valueClassName="text-[14px] font-medium"
//             items={[
//                {
//                   label: "Mẫu máy",
//                   value: (s) => s.machineModel?.name,
//                },
//                {
//                   label: "Nhà sản xuất",
//                   value: (s) => s.machineModel?.manufacturer,
//                },
//                {
//                   label: "Năm sản xuất",
//                   value: (s) => s.machineModel?.yearOfProduction,
//                },
//                {
//                   label: "Thời hạn bảo hành",
//                   value: (s) =>
//                      s.machineModel?.warrantyTerm === null || s.machineModel.warrantyTerm === undefined ? (
//                         <span>Không có bảo hành</span>
//                      ) : (
//                         <span className="flex flex-col">
//                            <span className="text-right">
//                               {dayjs(s.machineModel?.warrantyTerm).add(7, "days").format("DD/MM/YYYY")}
//                            </span>
//                            {hasExpired && (
//                               <Tag color="red-inverse" className="m-0">
//                                  Hết bảo hành
//                               </Tag>
//                            )}
//                         </span>
//                      ),
//                },
//                {
//                   label: "Mô tả",
//                   value: (s) => s.description,
//                },
//                {
//                   isDivider: true,
//                   label: "",
//                   value: () => null,
//                },
//                {
//                   label: "Khu vực",
//                   value: (s) => s.area?.name,
//                },
//                {
//                   label: "Vị trí (x, y)",
//                   value: (s) => (
//                      <a className="flex items-center gap-1">
//                         {s.positionX} x {s.positionY}
//                         <MapPin size={16} weight="fill" />
//                      </a>
//                   ),
//                },
//             ]}
//          />
//          <section className="mt-layout px-layout">
//             {api_deviceRequestHistory.isSuccess ? (
//                <>
//                   <List
//                      dataSource={props.api_deviceHistory.data?.slice(0, 2)}
//                      split
//                      header={
//                         <h5 className="text-lg font-medium text-neutral-500">
//                            Lịch sử sửa chữa ({props.api_deviceHistory.data?.length ?? "-"})
//                         </h5>
//                      }
//                      renderItem={(item, index) => (
//                         <List.Item
//                            className={cn(index === 0 && "mt-1")}
//                            extra={
//                               <div className="flex flex-col justify-between gap-1">
//                                  <div className="text-right">
//                                     {item.is_warranty && <Tag color="orange">Bảo hành</Tag>}
//                                     <Tag className="mr-0" color={FixRequest_StatusMapper(item).colorInverse}>
//                                        {FixRequest_StatusMapper(item).text}
//                                     </Tag>
//                                  </div>
//                                  <span className="text-right text-neutral-500">
//                                     {dayjs(item.updatedAt).add(7, "hours").format("DD/MM/YYYY")}
//                                  </span>
//                               </div>
//                            }
//                         >
//                            <List.Item.Meta
//                               title={item.requester.username}
//                               description={<span className="line-clamp-1">{item.requester_note}</span>}
//                            ></List.Item.Meta>
//                         </List.Item>
//                      )}
//                   />
//                   {props.api_deviceHistory.data && props.api_deviceHistory.data?.length > 2 && (
//                      <Device_ViewRequestHistoryDrawer>
//                         {(handleOpen) => (
//                            <Button
//                               type="dashed"
//                               className="mb-layout w-full"
//                               size="middle"
//                               onClick={() =>
//                                  props.api_device.isSuccess &&
//                                  props.api_request.isSuccess &&
//                                  handleOpen(props.api_device.data.id, props.api_request.data.id)
//                               }
//                            >
//                               Xem thêm
//                            </Button>
//                         )}
//                      </Device_ViewRequestHistoryDrawer>
//                   )}
//                </>
//             ) : (
//                <>
//                   {props.api_deviceHistory.isPending && (
//                      <Card className="mb-layout" size="small">
//                         <Spin>
//                            <div className="flex h-full items-center justify-center">Đang tải...</div>
//                         </Spin>
//                      </Card>
//                   )}
//                   {props.api_deviceHistory.isError && (
//                      <Card size="small" className="mb-layout">
//                         <Result
//                            status="error"
//                            title="Có lỗi xảy ra"
//                            subTitle="Vui lòng thử lại sau"
//                            extra={<Button onClick={() => props.api_deviceHistory.refetch()}>Thử lại</Button>}
//                         />
//                      </Card>
//                   )}
//                </>
//             )}
//          </section>
//       </div>
//    )
// }
//
// export default DeviceDetails
