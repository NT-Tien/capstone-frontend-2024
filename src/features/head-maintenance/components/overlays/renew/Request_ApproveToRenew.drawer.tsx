import head_department_mutations from "@/features/head-department/mutations"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { cn } from "@/lib/utils/cn.util"
import { CloseOutlined, MoreOutlined, SearchOutlined } from "@ant-design/icons"
import { DeviceTablet, Factory, Swap } from "@phosphor-icons/react"
import { App, Button, Card, Divider, Drawer, DrawerProps, Image, Input, Radio, Space, Spin, Tag } from "antd"
import { useMemo, useState } from "react"

type Query = {
   search: string
   hasDevices: boolean | null
}

type Request_ApproveToRenewDrawerProps = {
   requestId?: string
   isMultiple?: boolean
   onSuccess?: () => void
   machineModelId: string
}
type Props = Omit<DrawerProps, "children"> & Request_ApproveToRenewDrawerProps

function Request_ApproveToRenewDrawer(props: Props) {
   const { modal } = App.useApp()
   const [query, setQuery] = useState<Query>({
      search: "",
      hasDevices: null,
   })
   const [selectedMachineModel, setSelectedMachineModel] = useState<MachineModelDto | null>(null)
   const [note, setNote] = useState("")

   const api_machineModels = head_maintenance_queries.device.all_unused({})

   const api_request = head_maintenance_queries.request.one(
      {
         id: props.requestId ?? "",
      },
      {
         enabled: !!props.requestId,
      },
   )
   const mutate_createRenewRequest = head_maintenance_mutations.request.approveToRenew()
   const mutate_createRenewEmptyDeviceRequest = head_maintenance_mutations.request.approveToRenewEmptyDevice()

   const renderList = useMemo(() => {
      if (!api_machineModels.isSuccess || !api_request.isSuccess) return { recommended: [], normal: [] }
      const currentMachineModelId = api_request.data.device.machineModel.id

      let list = api_machineModels.data.filter((mm) => mm.devices.length > 0)
      const recommended = list.filter((mm) => mm.id === currentMachineModelId)
      const normal = list.filter((mm) => mm.id !== currentMachineModelId)

      if (query.search) {
         const searchFilter = (mm: { name: string }) => mm.name.toLowerCase().includes(query.search.toLowerCase())
         return {
            recommended: recommended.filter(searchFilter),
            normal: normal.filter(searchFilter),
         }
      }
      return { recommended, normal }

      // return list.sort((a, b) => a.name.localeCompare(b.name))
   }, [api_machineModels.data, api_machineModels.isSuccess, api_request.data, api_request.isSuccess, query.search])

   function handleSubmit() {
      if (!selectedMachineModel) {
         modal.error({
            title: "Lỗi",
            content: "Vui lòng chọn thiết bị mới trước khi xác nhận.",
         })
         return
      }
      console.log("Selected Machine Model:", selectedMachineModel)
      console.log("Device Renew ID:", selectedMachineModel.devices)
      modal.confirm({
         title: "Xác nhận thay máy",
         content: `Bạn có chắc chắn muốn thay máy mới cho yêu cầu này không?`,
         onOk: () => {
            if (!props.requestId || !api_request.isSuccess) return
            setSelectedMachineModel(selectedMachineModel)
            mutate_createRenewRequest.mutate(
               {
                  id: props.requestId,
                  payload: {
                     deviceId: selectedMachineModel?.devices[0]?.id,
                     note: api_request.data.requester_note,
                     isMultiple: props.isMultiple,
                  },
               },
               {
                  onSuccess: props.onSuccess,
               },
            )
         },
         okText: "Xác nhận",
         cancelText: "Hủy",
         closable: true,
         centered: true,
         maskClosable: true,
      })
   }

   return (
      <Drawer
         title={
            <div className={"flex w-full items-center justify-between"}>
               <Button className={"text-white"} icon={<CloseOutlined />} type={"text"} onClick={props.onClose} />
               <h1 className={"text-lg font-semibold"}>Xác nhận thay máy</h1>
               <Button className={"text-white"} icon={<MoreOutlined />} type={"text"} />
            </div>
         }
         closeIcon={false}
         placement="bottom"
         height="80%"
         width="100%"
         classNames={{
            footer: "p-layout",
            header: "bg-head_maintenance text-white *:text-white",
         }}
         loading={api_request.isPending}
         footer={
            <Button
               block
               type={"primary"}
               size={"large"}
               icon={<Swap size={16} />}
               onClick={handleSubmit}
               disabled={!selectedMachineModel || !note}
            >
               Xác nhận
            </Button>
         }
         {...props}
      >
         <section className="mb-10">
            <header className="mb-3">
               <h2 className="text-base font-semibold">Ghi chú</h2>
               <p className="font-base text-sm text-neutral-500">Ghi chú cho quá trình thay máy</p>
            </header>
            <Input.TextArea
               placeholder="Nhập ghi chú"
               autoSize={{ minRows: 3, maxRows: 5 }}
               showCount
               maxLength={200}
               value={note}
               onChange={(e) => {
                  setNote(e.target.value)
               }}
            />
         </section>
         <section>
            <header className="mb-3">
               <h2 className="text-base font-semibold">Thiết bị mới</h2>
               <p className="font-base text-sm text-neutral-500">Chọn thiết bị mới trong số các thiết bị sau</p>
            </header>
            {api_machineModels.isSuccess ? (
               <>
                  <Input
                     addonBefore={<SearchOutlined />}
                     placeholder="Tìm kiếm"
                     className="mb-3"
                     value={query.search}
                     onChange={(e) => {
                        setQuery((prev) => ({ ...prev, search: e.target.value }))
                     }}
                  />
                  <main className="grid grid-cols-2 gap-2 mb-3">
                     {renderList?.recommended.map((mm) => (
                        <Card
                           key={mm.id}
                           cover={
                              <Image
                                 src={mm.image}
                                 alt={mm.name}
                                 rootClassName="w-full h-32"
                                 wrapperClassName="w-full h-32"
                                 className="h-32 w-full rounded-t-lg object-cover"
                                 preview={false}
                              />
                           }
                           className={cn(
                              "relative w-full rounded-lg border-2 border-green-500 bg-neutral-100",
                              selectedMachineModel?.id === mm.id && "bg-red-200",
                           )}
                           classNames={{
                              body: "px-2 py-4",
                           }}
                           onClick={() => {
                              setSelectedMachineModel(mm)
                           }}
                        >
                           <Tag color="green" className="absolute left-2 top-2">
                              Đề xuất
                           </Tag>
                           <Radio
                              className="absolute right-2 top-2 z-50"
                              checked={selectedMachineModel?.id === mm.id}
                           />
                           <Card.Meta
                              title={<h3 className="truncate text-sm">{mm.name}</h3>}
                              description={
                                 <Space split={<Divider type="vertical" className="m-0" />} wrap className="text-xs">
                                    <div className="flex items-center gap-1">
                                       <DeviceTablet size={16} weight="duotone" />
                                       {mm.devices.length}
                                    </div>
                                    <div className="flex items-center gap-1">
                                       <Factory size={16} weight="duotone" />
                                       {mm.manufacturer}
                                    </div>
                                 </Space>
                              }
                           />
                        </Card>
                     ))}
                  </main>
                  <main className="grid grid-cols-2 gap-2">
                     {renderList?.normal.map((mm) => (
                        <Card
                           key={mm.id}
                           cover={
                              <Image
                                 src={mm.image}
                                 alt={mm.name}
                                 rootClassName="w-full h-32"
                                 wrapperClassName="w-full h-32"
                                 className="h-32 w-full rounded-t-lg object-cover"
                                 preview={false}
                              />
                           }
                           className={cn(
                              "relative w-full rounded-lg bg-neutral-100",
                              selectedMachineModel?.id === mm.id && "bg-red-200",
                           )}
                           classNames={{
                              body: "px-2 py-4",
                           }}
                           onClick={() => {
                              setSelectedMachineModel(mm)
                           }}
                        >
                           <Radio
                              className="absolute right-2 top-2 z-50"
                              checked={selectedMachineModel?.id === mm.id}
                           />
                           <Card.Meta
                              title={<h3 className="truncate text-sm">{mm.name}</h3>}
                              description={
                                 <Space split={<Divider type="vertical" className="m-0" />} wrap className="text-xs">
                                    <div className="flex items-center gap-1">
                                       <DeviceTablet size={16} weight="duotone" />
                                       {mm.devices.length}
                                    </div>
                                    <div className="flex items-center gap-1">
                                       <Factory size={16} weight="duotone" />
                                       {mm.manufacturer}
                                    </div>
                                 </Space>
                              }
                           />
                        </Card>
                     ))}
                  </main>
               </>
            ) : (
               <>
                  {api_machineModels.isPending && (
                     <div className="grid h-full w-full place-items-center">
                        <Spin />
                     </div>
                  )}
               </>
            )}
         </section>
      </Drawer>
   )
}

export default Request_ApproveToRenewDrawer
export type { Request_ApproveToRenewDrawerProps }
