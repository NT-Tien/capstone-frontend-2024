import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"

type Props = {
   machine_1: MachineModelDto
   machine_2: MachineModelDto
}

function MachineModelComparison(props: Props) {
   return (
      <table className="w-full divide-y divide-gray-300">
         <thead>
            <tr className="divide-x divide-gray-200">
               <th
                  scope="col"
                  className="whitespace-nowrap py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
               >
                  So sánh
               </th>
               <th
                  scope="col"
                  className="whitespace-nowrap py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
               >
                  {props.machine_1.name}
               </th>
               <th
                  scope="col"
                  className="whitespace-nowrap py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
               >
                  {props.machine_2.name}
               </th>
            </tr>
         </thead>
         <tbody className="divide-y divide-gray-200 bg-white">
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Mô tả
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">
                  <p className="line-clamp-3">{props.machine_1.description}</p>
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">
                  <p className="line-clamp-3">{props.machine_2.description}</p>
               </td>
            </tr>
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Nhà sản xuất
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">
                  {props.machine_1.manufacturer}
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">
                  {props.machine_2.manufacturer}
               </td>
            </tr>
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Đời máy
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">
                  {props.machine_1.yearOfProduction}
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">
                  {props.machine_2.yearOfProduction}
               </td>
            </tr>
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Loại kim
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_1.needleType}</td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_2.needleType}</td>
            </tr>
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Loại vải
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_1.fabric}</td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_2.fabric}</td>
            </tr>
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Tính năng
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_1.features}</td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_2.features}</td>
            </tr>
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Bôi trơn
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_1.lubrication}</td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_2.lubrication}</td>
            </tr>
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Công suất
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_1.power}</td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_2.power}</td>
            </tr>
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Độ cao chân vịt
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_1.presser}</td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_2.presser}</td>
            </tr>
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Kích thước
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_1.size}</td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_2.size}</td>
            </tr>
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Tốc độ
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_1.speed}</td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_2.speed}</td>
            </tr>
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Mũi kim
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_1.stitch}</td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_2.stitch}</td>
            </tr>
            <tr className="divide-x divide-gray-200">
               <td className="min-w-24 whitespace-normal bg-neutral-100 p-2 text-sm font-medium text-gray-500">
                  Điện áp
               </td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_1.voltage}</td>
               <td className="min-w-44 whitespace-pre-wrap p-4 text-sm text-gray-500">{props.machine_2.voltage}</td>
            </tr>
         </tbody>
      </table>
   )
}

export default MachineModelComparison
