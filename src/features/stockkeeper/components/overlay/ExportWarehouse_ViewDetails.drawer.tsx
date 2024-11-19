import { App, Button, Descriptions, Drawer, DrawerProps, Dropdown, List, Tabs, Tag } from "antd"
import { MoreOutlined } from "@ant-design/icons"
import stockkeeper_mutations from "@/features/stockkeeper/mutations"
import stockkeeper_queries from "@/features/stockkeeper/queries"
import { ExportType } from "@/lib/domain/ExportWarehouse/ExportType.enum"
import dayjs from "dayjs"
import { useMemo, useRef } from "react"
import IssueSparePartUtil from "@/lib/domain/IssueSparePart/IssueSparePart.util"
import { cn } from "@/lib/utils/cn.util"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import ExportWarehouse_DelayModal from "@/features/stockkeeper/components/overlay/ExportWarehouse_DelayModal"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import DeviceUtil from "@/lib/domain/Device/Device.util"

type ExportWarehouse_ViewDetailsDrawerProps = {
   id?: string
   refetchFn?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   ExportWarehouse_ViewDetailsDrawerProps & {
      handleClose?: () => void
   }

function ExportWarehouse_ViewDetailsDrawer(props: Props) {
   const { modal } = App.useApp()

   const control_exportWarehouseDelayDrawer = useRef<RefType<ExportWarehouse_ViewDetailsDrawerProps>>(null)

   const mutate_accept = stockkeeper_mutations.exportWarehouse.accept()
   const mutate_delay = stockkeeper_mutations.exportWarehouse.delay()

   const api_export = stockkeeper_queries.exportWarehouse.oneById(
      {
         id: props.id ?? "",
      },
      {
         enabled: !!props.id,
      },
   )

   function acceptExport(id: string) {
      modal.confirm({
         title: "Xác nhận",
         content: "Bạn có chắc chắn muốn duyệt đơn xuất này?",
         onOk: () => {
            mutate_accept.mutate(
               {
                  id,
               },
               {
                  onSuccess: () => {
                     props.handleClose?.()
                     props.refetchFn?.()
                  },
               },
            )
         },
         centered: true,
         maskClosable: true,
      })
   }

   function delayExport() {}

   function isIssueDto(item: DeviceDto | IssueDto): item is IssueDto {
      return (item as IssueDto).issueSpareParts !== undefined;
   }
   
   // function isDeviceDto(item: DeviceDto | IssueDto): item is IssueDto {
   //    return (item as IssueDto).task.device_renew !== undefined
   // }

   const uniqueSpareParts = useMemo(() => {
      const details = Array.isArray(api_export.data?.detail) ? api_export.data?.detail : [];
      return IssueSparePartUtil.mapToUniqueSpareParts(
         details.flatMap((i) => (isIssueDto(i) ? i.issueSpareParts : []))
      );
   }, [api_export.data?.detail]);

   // const uniqueDevice = useMemo(() => {
   //    const details = Array.isArray(api_export.data?.detail) ? api_export.data?.detail : []
   //    return DeviceUtil.mapToUniqueDevice(details.flatMap((i) => (isDeviceDto(i) ? i.task.device_renew : [])))
   // }, [api_export.data?.detail])
   

   return (
      <Drawer
         title={"Chi tiết đơn xuất"}
         loading={api_export.isPending}
         footer={
            <div className={"flex items-center gap-2"}>
               <Button block size={"large"} type={"primary"} onClick={() => props.id && acceptExport(props.id)}>
                  Duyệt đơn
               </Button>
               <Dropdown
                  menu={{
                     items: [
                        {
                           key: "1",
                           label: "Linh kiện không lấy được",
                           onClick: () => {
                              control_exportWarehouseDelayDrawer.current?.handleOpen({
                                 id: props.id,
                              })
                           },
                        },
                     ],
                  }}
               >
                  <Button size={"large"} icon={<MoreOutlined />} className={"aspect-square"} />
               </Dropdown>
            </div>
         }
         classNames={{
            footer: "p-layout",
         }}
         {...props}
      >
         <Descriptions
            column={1}
            items={[
               {
                  label: "Ngày tạo",
                  children: dayjs(api_export.data?.createdAt).format("DD/MM/YYYY"),
               },
               {
                  label: "Trạng thái",
                  children: api_export.data?.status,
               },
               {
                  label: "Xuất",
                  children: api_export.data?.export_type === ExportType.SPARE_PART ? "Linh kiện" : "Thiết bị",
               },
            ]}
         />
         <Tabs
            className={"mt-3"}
            items={[
               ...(api_export.data?.export_type === ExportType.SPARE_PART
                  ? [
                       {
                          key: "spare-parts",
                          label: "Linh kiện",
                          children: (
                             <List
                                dataSource={uniqueSpareParts}
                                renderItem={(item, index) => {
                                   const notEnoughInWarehouse = item.quantity > item.sparePart.quantity;
                                   return (
                                      <List.Item className={cn(index === 0 && "pt-0")}>
                                         <List.Item.Meta
                                            title={item.sparePart.name}
                                            description={
                                               <div className={"flex items-center justify-between gap-2"}>
                                                  <div>x{item.quantity}</div>
                                                  {notEnoughInWarehouse && (
                                                     <Tag color={"red-inverse"}>Không đủ trong kho</Tag>
                                                  )}
                                               </div>
                                            }
                                         />
                                      </List.Item>
                                   );
                                }}
                             />
                          ),
                       },
                    ]
                  : []),
               // ...(api_export.data?.export_type === ExportType.DEVICE
               //    ? [
               //         {
               //            key: "device",
               //            label: "Thiết bị",
               //            children: (
               //               <List dataSource={uniqueDevice} renderItem={(item, index) => {
               //                return (
               //                   <List.Item className={cn(index === 0 && "pt-0")}>
               //                      <List.Item.Meta title={item.device.description}/>
               //                   </List.Item>
               //                )
               //               }}/>
               //            ),
               //         },
               //      ]
               //    : []),
               {
                  key: "task",
                  label: "Tác vụ",
                  children: (
                     <Descriptions
                        column={1}
                        items={[
                           {
                              label: "Tên tác vụ",
                              children: api_export.data?.task.name,
                           },
                           {
                              label: "Người sửa chữa",
                              children: api_export.data?.task.fixer?.username ?? "-",
                           },
                           {
                              label: "Ngày sửa chữa",
                              children: api_export.data?.task?.fixerDate
                                 ? dayjs(api_export.data?.task?.fixerDate).format("DD/MM/YYYY")
                                 : "-",
                           },
                           {
                              label: "Thiết bị mới",
                              children: api_export.data?.task?.device_renew?.id
                           }
                        ]}
                     />
                  ),
               },
            ]}
         />
         <OverlayControllerWithRef ref={control_exportWarehouseDelayDrawer}>
            <ExportWarehouse_DelayModal refetchFn={props.refetchFn} onSuccess={() => props.handleClose?.()} />
         </OverlayControllerWithRef>
      </Drawer>
   )
}

export default ExportWarehouse_ViewDetailsDrawer
export type { ExportWarehouse_ViewDetailsDrawerProps }
