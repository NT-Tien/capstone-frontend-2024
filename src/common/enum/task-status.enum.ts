import type { LiteralUnion } from "antd/es/_util/type"
import type { PresetColorType, PresetStatusColorType } from "antd/es/_util/colors"

export enum TaskStatus {
   AWAITING_FIXER = "AWAITING_FIXER", // can update issues, DO NOT DELETE
   PENDING_STOCK = "PENDING_STOCK", // -
   ASSIGNED = "ASSIGNED", // cannot update issues
   IN_PROGRESS = "IN_PROGRESS", // ---
   COMPLETED = "COMPLETED",
   CANCELLED = "CANCELLED",
}

export const TaskStatusTagMapper: {
   [key: string]: {
      text: string
      color: LiteralUnion<PresetColorType | PresetStatusColorType>
      colorInverse?: LiteralUnion<PresetColorType | PresetStatusColorType>
   }
} = {
   [TaskStatus.AWAITING_FIXER]: {
      text: "Unassigned",
      color: "default",
   },
   [TaskStatus.PENDING_STOCK]: {
      text: "Pending Stock",
      colorInverse: "orange-inverse",
      color: "orange",
   },
   [TaskStatus.ASSIGNED]: {
      text: "Assigned",
      colorInverse: "blue-inverse",
      color: "blue",
   },
   [TaskStatus.IN_PROGRESS]: {
      text: "In Progress",
      colorInverse: "processing",
      color: "processing",
   },
   [TaskStatus.COMPLETED]: {
      text: "Completed",
      colorInverse: "green-inverse",
      color: "green",
   },
   [TaskStatus.CANCELLED]: {
      text: "Cancelled",
      colorInverse: "red-inverse",
      color: "red",
   },
   undefined: {
      text: "-",
      colorInverse: "default",
      color: "default",
   },
}
