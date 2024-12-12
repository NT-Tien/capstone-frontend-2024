import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { Drawer, DrawerProps } from "antd"

type Device_SpecsDrawerProps = {
   data?: MachineModelDto
}
type Props = Omit<DrawerProps, "children"> & Device_SpecsDrawerProps

function Device_SpecsDrawer(props: Props) {
    const specs = {
        "Tên mẫu máy": props.data?.name,
        "Nhà sản xuất": props.data?.manufacturer,
        "Năm sản xuất": props.data?.yearOfProduction,
        "Bôi trơn": props.data?.lubrication,
        "Tính năng": props.data?.features,
        "Loại kim": props.data?.needleType,
        "Tốc độ": props.data?.speed,
        "Công suất": props.data?.power,
        "Mũi chỉ": props.data?.needleType,
        "Chân vít": props.data?.presser,
        "Kích thước": props.data?.size,
        "Điện áp": props.data?.voltage,
    }

   return (
      <Drawer title="Thông số thiết bị" placement='bottom' height='80%' classNames={{
        body: "p-0",
        wrapper: "rounded-t-xl"
      }} {...props}>
         {props.data && (
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Thông số
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Giá trị
                     </th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200 bg-white">
                  {Object.entries(specs).map(([key, value]) => (
                     <tr key={key}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{key}</td>
                        <td className="whitespace-pre-wrap px-6 py-4 text-sm text-gray-500">{value?.toString()}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         )}
      </Drawer>
   )
}

export default Device_SpecsDrawer
export type { Device_SpecsDrawerProps }
