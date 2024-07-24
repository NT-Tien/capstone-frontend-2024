import { PresetColorType, type PresetStatusColorType } from "antd/es/_util/colors"
import { LiteralUnion } from "antd/es/_util/type"

export enum FixRequestStatus {
   PENDING = "PENDING",
   APPROVED = "APPROVED",
   REJECTED = "REJECTED",
   IN_PROGRESS = "IN_PROGRESS",
   CLOSED = "CLOSED",
}

export const FixRequestStatusTagMapper: {
   [key: string]: {
      text: string
      color: LiteralUnion<PresetColorType | PresetStatusColorType>
      colorInverse: LiteralUnion<PresetColorType | PresetStatusColorType>
   }
} = {
   [FixRequestStatus.PENDING]: {
      text: "Đang chờ",
      colorInverse: "yellow-inverse",
      color: "yellow",
   },
   [FixRequestStatus.APPROVED]: {
      text: "Xác nhận",
      colorInverse: "green-inverse",
      color: "green",
   },
   [FixRequestStatus.REJECTED]: {
      text: "Từ chối",
      colorInverse: "red-inverse",
      color: "red",
   },
   [FixRequestStatus.IN_PROGRESS]: {
      text: "Đang thực hiện",
      colorInverse: "blue-inverse",
      color: "blue",
   },
   [FixRequestStatus.CLOSED]: {
      text: "Đóng",
      colorInverse: "default",
      color: "default",
   },
   undefined: {
      text: "-",
      colorInverse: "default",
      color: "default",
   },
}
