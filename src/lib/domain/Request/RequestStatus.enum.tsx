import { PresetColorType, type PresetStatusColorType } from "antd/es/_util/colors"
import { LiteralUnion } from "antd/es/_util/type"

export enum FixRequestStatus {
   PENDING = "PENDING", // mới tạo request, chưa xem / đã xem
   HEAD_CANCEL = "HEAD_CANCEL", // trưởng phòng từ chối
   APPROVED = "APPROVED", // có ít nhất 1 issue
   IN_PROGRESS = "IN_PROGRESS", // có ít nhất 1 task
   REJECTED = "REJECTED", //
   HEAD_CONFIRM = "HEAD_CONFIRM",
   CLOSED = "CLOSED", // all tasks finished
   not_seen = "not_seen",
   has_seen = "has_seen",
}

export const FixRequestStatusTagMapper: {
   [key: string]: {
      text: string
      color: LiteralUnion<PresetColorType | PresetStatusColorType>
      colorInverse: LiteralUnion<PresetColorType | PresetStatusColorType>
   }
} = {
   [FixRequestStatus.PENDING]: {
      text: "Chưa xử lý",
      colorInverse: "default",
      color: "default",
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
      colorInverse: "purple-inverse",
      color: "purple",
   },
   undefined: {
      text: "-",
      colorInverse: "default",
      color: "default",
   },
}
