import { LiteralUnion } from "antd/es/_util/type"
import { PresetColorType, type PresetStatusColorType } from "antd/es/_util/colors"

export enum IssueStatusEnum {
   PENDING = "PENDING",
   FAILED = "FAILED",
   RESOLVED = "RESOLVED",
   CANCELLED = "CANCELLED",
}

export const IssueStatusEnumTagMapper: {
   [key: string]: {
      text: string
      color: LiteralUnion<PresetColorType | PresetStatusColorType>
      colorInverse: LiteralUnion<PresetColorType | PresetStatusColorType>
      className: string
   }
} = {
   [IssueStatusEnum.PENDING]: {
      text: "Chưa xử lý",
      color: "default",
      colorInverse: "default",
      className: "text-gray-400",
   },
   [IssueStatusEnum.FAILED]: {
      text: "Thất bại",
      color: "red",
      colorInverse: "red-inverse",
      className: "text-red-400",
   },
   [IssueStatusEnum.RESOLVED]: {
      text: "Thành công",
      color: "green",
      colorInverse: "green-inverse",
      className: "text-green-400",
   },
   [IssueStatusEnum.CANCELLED]: {
      text: "Đã hủy",
      color: "purple",
      colorInverse: "purple-inverse",
      className: "text-purple-400",
   },
}
