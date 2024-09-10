"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, Typography } from "antd"
import Admin_Devices_OneByAreaId from "../_api/devices/one-byAreaId.api"
import { CheckSquareOffset, Devices, Gear, Note } from "@phosphor-icons/react"
import { admin_qk } from "../_api/qk"

const areaIds = [
   "13734c3c-5f3b-472e-805f-557c1f08eeb2",
   "4727b5ec-87a9-4aec-9aef-c56f06258426",
   "6b2e4394-239d-437e-b5a5-62be14dea23e",
   "7be024ff-39bb-4ae1-b9a0-996a71e2e966",
   "3d78678d-1f25-4df7-8a84-6640a7692456",
]
type AreaProps = {
   id: string
   areaNames: string
}
const cardColors = ["bg-orange-200", "bg-blue-200", "bg-green-200", "bg-purple-200", "bg-yellow-200"]
function AreaRequestCard({ id, areaNames, bgColor }: AreaProps & { bgColor: string }) {
   const apiRequest = useQuery({
      queryKey: admin_qk.devices.byAreaId(id),
      queryFn: () => Admin_Devices_OneByAreaId({ id: id }),
   })
   const totalRequests = apiRequest.data?.total_requests || 0

   return (
      <section className="mt-5">
         <h1 className="text-2xl font-normal">{areaNames}</h1>
         <div className="mt-0">
            <Card
               loading={apiRequest.isLoading}
               className={`bourder-neutral-300 mt-5 flex h-24 items-center justify-between rounded-lg border-2 ${bgColor} p-0 text-center shadow-md`}
               classNames={{
                  body: "w-full",
               }}
            >
               <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-start">
                     <div className="text-xl">Tổng cộng</div>
                     <div className="flex items-center">
                        <div className="flex align-bottom text-3xl font-bold">{totalRequests}</div>
                        <Typography.Text className="ml-2 flex items-end text-base">yêu cầu</Typography.Text>
                     </div>
                  </div>
                  <div className="flex items-center">
                     <Note size={45} weight="duotone" />
                  </div>
               </div>
            </Card>
         </div>
      </section>
   )
}
function AreaTaskCard({ id, areaNames, bgColor }: AreaProps & { bgColor: string }) {
   const apiRequest = useQuery({
      queryKey: admin_qk.devices.byAreaId(id),
      queryFn: () => Admin_Devices_OneByAreaId({ id: id }),
   })
   const totalTasks = apiRequest.data?.total_tasks || 0

   return (
      <section className="mt-5">
         <h1 className="invisible text-2xl font-normal">{areaNames}</h1>

         <div className="mt-0">
            <Card
               loading={apiRequest.isLoading}
               className={`bourder-neutral-300 mt-5 flex h-24 items-center justify-between rounded-lg border-2 ${bgColor} p-0 text-center shadow-md`}
               classNames={{
                  body: "w-full",
               }}
            >
               <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-start">
                     <div className="text-xl">Tổng cộng</div>
                     <div className="flex items-center">
                        <div className="flex align-bottom text-3xl font-bold">{totalTasks}</div>
                        <Typography.Text className="ml-2 flex items-end text-base">tác vụ</Typography.Text>
                     </div>
                  </div>
                  <div className="flex items-center">
                     <CheckSquareOffset size={45} weight="duotone" />
                  </div>
               </div>
            </Card>
         </div>
      </section>
   )
}
function AreaDevicesCard({ id, areaNames, bgColor }: AreaProps & { bgColor: string }) {
   const apiRequest = useQuery({
      queryKey: admin_qk.devices.byAreaId(id),
      queryFn: () => Admin_Devices_OneByAreaId({ id: id }),
   })
   const totalDevices = apiRequest.data?.total_devices || 0

   return (
      <section className="mt-5">
         <h1 className="invisible text-2xl font-normal">{areaNames}</h1>

         <div className="mt-0">
            <Card
               loading={apiRequest.isLoading}
               className={`bourder-neutral-300 mt-5 flex h-24 items-center justify-between rounded-lg border-2 ${bgColor} p-0 text-center shadow-md`}
               classNames={{
                  body: "w-full",
               }}
            >
               <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-start">
                     <div className="text-xl">Tổng cộng</div>
                     <div className="flex items-center">
                        <div className="flex align-bottom text-3xl font-bold">{totalDevices}</div>
                        <Typography.Text className="ml-2 flex items-end text-base">thiết bị</Typography.Text>
                     </div>
                  </div>
                  <div className="flex items-center">
                     <Devices size={45} weight="duotone" />
                  </div>
               </div>
            </Card>
         </div>
      </section>
   )
}

export default function AdminHomePage() {
   return (
      <div className="grid grid-cols-2 gap-12">
         <div>
            {areaIds.map((id, index) => (
               <AreaRequestCard
                  key={id}
                  id={id}
                  areaNames={`Area ${index + 1}`}
                  bgColor={cardColors[index % cardColors.length]}
               />
            ))}
         </div>
         <div>
            {areaIds.map((id, index) => (
               <AreaTaskCard
                  key={id}
                  id={id}
                  areaNames={`Area ${index + 1}`}
                  bgColor={cardColors[index % cardColors.length]}
               />
            ))}
         </div>
         {/* <div>
            {areaIds.map((id, index) => (
               <AreaDevicesCard
                  key={id}
                  id={id}
                  areaNames={`Area ${index + 1}`}
                  bgColor={cardColors[index % cardColors.length]}
               />
            ))}
         </div> */}
      </div>
   )
}
