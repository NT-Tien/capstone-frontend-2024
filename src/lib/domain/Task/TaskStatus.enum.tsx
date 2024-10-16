import type { LiteralUnion } from "antd/es/_util/type"
import type { PresetColorType, PresetStatusColorType } from "antd/es/_util/colors"
import { ReactNode } from "react"
import { Note, Package, SealCheck, Tray, UserMinus, Wrench, XCircle } from "@phosphor-icons/react"

export enum TaskStatus {
   AWAITING_FIXER = "AWAITING_FIXER", // can update issues, DO NOT DELETE
   AWAITING_SPARE_SPART = "AWAITING_SPARE_SPART", // -
   ASSIGNED = "ASSIGNED", // cannot update issues
   IN_PROGRESS = "IN_PROGRESS", // ---
   HEAD_STAFF_CONFIRM = "HEAD_STAFF_CONFIRM", // HEAD_DEPARTMENT_CONFIRM in reality
   COMPLETED = "COMPLETED",
   CANCELLED = "CANCELLED",
}

export const TaskStatusTagMapper: {
   [key: string]: {
      text: string
      color: LiteralUnion<PresetColorType | PresetStatusColorType>
      colorInverse?: LiteralUnion<PresetColorType | PresetStatusColorType>
      icon: ReactNode
      className: string
      description: string
      index: number
   }
} = {
   [TaskStatus.AWAITING_FIXER]: {
      text: "Chưa phân công",
      color: "default",
      icon: <UserMinus size={16} />,
      className: "text-lime-600",
      description: "Tác vụ chưa được phân công cho nhân viên sửa chữa",
      index: 1,
   },
   [TaskStatus.AWAITING_SPARE_SPART]: {
      text: "Chờ linh kiện",
      colorInverse: "orange-inverse",
      color: "orange",
      icon: <Package size={16} />,
      className: "text-orange-500",
      description: "Tác vụ đang chờ linh kiện để tiếp tục sửa chữa",
      index: 0,
   },
   [TaskStatus.ASSIGNED]: {
      text: "Đã phân công",
      colorInverse: "blue-inverse",
      color: "blue",
      icon: <Tray size={16} />,
      className: "text-neutral-500",
      description: "Tác vụ đang chờ nhân viên thực hiện",
      index: 2,
   },
   [TaskStatus.IN_PROGRESS]: {
      text: "Đang làm",
      colorInverse: "processing",
      color: "processing",
      icon: <Wrench size={16} />,
      className: "text-blue-500",
      description: "Tác vụ đang được thực hiện",
      index: 3,
   },
   [TaskStatus.HEAD_STAFF_CONFIRM]: {
      text: "Chờ kiểm tra",
      colorInverse: "processing",
      color: "processing",
      icon: <Note size={16} />,
      className: "text-gold-500",
      description: "Tác vụ đang chờ phê duyệt từ trưởng bảo trì",
      index: 4,
   },
   [TaskStatus.COMPLETED]: {
      text: "Hoàn thành",
      colorInverse: "green-inverse",
      color: "green",
      icon: <SealCheck size={16} />,
      className: "text-green-500",
      description: "Tác vụ đã hoàn thành",
      index: 5,
   },
   [TaskStatus.CANCELLED]: {
      text: "Đã hủy",
      colorInverse: "red-inverse",
      color: "red",
      icon: <XCircle size={16} />,
      className: "text-red-500",
      description: "Tác vụ đã bị hủy",
      index: 6,
   },
   undefined: {
      text: "-",
      colorInverse: "default",
      color: "default",
      icon: <Tray size={16} />,
      className: "text-neutral-500",
      description: "Không xác định",
      index: -1,
   },
}
