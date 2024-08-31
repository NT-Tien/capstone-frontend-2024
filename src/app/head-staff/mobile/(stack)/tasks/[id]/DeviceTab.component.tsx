import DataListView from "@/common/components/DataListView"
import { TaskDto } from "@/common/dto/Task.dto"
import { MapPin } from "@phosphor-icons/react"
import { UseQueryResult } from "@tanstack/react-query"

type Props = {
   api: UseQueryResult<TaskDto, Error>
}

export default function DeviceTab(props: Props) {
   return (
      <section className="std-layout-outer rounded-lg bg-white py-layout">
         <DataListView
            dataSource={props.api.data?.device}
            bordered
            itemClassName="py-2"
            labelClassName="font-normal text-neutral-500 text-sub-base"
            valueClassName="text-sub-base"
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
                  label: "Nhà sản xuất",
                  value: (s) => s.machineModel?.manufacturer,
               },
               {
                  label: "Năm sản xuất",
                  value: (s) => s.machineModel?.yearOfProduction,
               },
               {
                  label: "Thời hạn bảo hành",
                  value: (s) => s.machineModel?.warrantyTerm,
               },
               {
                  label: "Description",
                  value: (s) => s.description,
               },
            ]}
         />
      </section>
   )
}
