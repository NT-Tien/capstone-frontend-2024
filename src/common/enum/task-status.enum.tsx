import type { LiteralUnion } from "antd/es/_util/type"
import type { PresetColorType, PresetStatusColorType } from "antd/es/_util/colors"
import { ReactNode } from "react"
import { Note, Package, SealCheck, Tray, UserMinus, Wrench, XCircle } from "@phosphor-icons/react"

export enum TaskStatus {
   AWAITING_FIXER = "AWAITING_FIXER", // can update issues, DO NOT DELETE
   AWAITING_SPARE_SPART = "AWAITING_SPARE_SPART", // -
   ASSIGNED = "ASSIGNED", // cannot update issues
   IN_PROGRESS = "IN_PROGRESS", // ---
   HEAD_STAFF_CONFIRM = "HEAD_STAFF_CONFIRM", // ---
   COMPLETED = "COMPLETED",
   CANCELLED = "CANCELLED",
}

export const TaskStatusTagMapper: {
   [key: string]: {
      text: string
      color: LiteralUnion<PresetColorType | PresetStatusColorType>
      colorInverse?: LiteralUnion<PresetColorType | PresetStatusColorType>
      icon: ReactNode
   }
} = {
   [TaskStatus.AWAITING_FIXER]: {
      text: "Chưa phân công",
      color: "default",
      icon: <UserMinus size={16} />,
   },
   [TaskStatus.AWAITING_SPARE_SPART]: {
      text: "Chờ hàng",
      colorInverse: "orange-inverse",
      color: "orange",
      icon: <Package size={16} />,
   },
   [TaskStatus.ASSIGNED]: {
      text: "Đã phân công",
      colorInverse: "blue-inverse",
      color: "blue",
      icon: <Tray size={16} />,
   },
   [TaskStatus.IN_PROGRESS]: {
      text: "Đang làm",
      colorInverse: "processing",
      color: "processing",
      icon: <Wrench size={16} />,
   },
   [TaskStatus.HEAD_STAFF_CONFIRM]: {
      text: "Chờ xác nhận",
      colorInverse: "processing",
      color: "processing",
      icon: <Note size={16} />,
   },
   [TaskStatus.COMPLETED]: {
      text: "Hoàn thành",
      colorInverse: "green-inverse",
      color: "green",
      icon: <SealCheck size={16} />,
   },
   [TaskStatus.CANCELLED]: {
      text: "Đã hủy",
      colorInverse: "red-inverse",
      color: "red",
      icon: <XCircle size={16} />,
   },
   undefined: {
      text: "-",
      colorInverse: "default",
      color: "default",
      icon: <Tray size={16} />,
   },
}
