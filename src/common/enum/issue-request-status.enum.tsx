import { Tag, TagProps } from "antd"
import { PresetColorType, type PresetStatusColorType } from "antd/es/_util/colors"
import { LiteralUnion } from "antd/es/_util/type"

export enum FixRequestStatus {
   PENDING = "PENDING",
   APPROVED = "APPROVED",
   REJECTED = "REJECTED",
}

export function IssueRequestStatusTag({ status, ...props }: { status?: FixRequestStatus } & TagProps) {
   const colorMap: {
      [key in FixRequestStatus]: LiteralUnion<
         PresetColorType | "success" | "processing" | "error" | "default" | "warning"
      >
   } = {
      PENDING: "default",
      APPROVED: "success",
      REJECTED: "red",
   }

   return (
      <Tag color={status ? colorMap[status] : "default"} {...props}>
         {status}
      </Tag>
   )
}

export const FixRequestStatusTagMapper: {
   [key: string]: {
      text: string
      color: LiteralUnion<PresetColorType | PresetStatusColorType>
      colorInverse: LiteralUnion<PresetColorType | PresetStatusColorType>
   }
} = {
   [FixRequestStatus.PENDING]: {
      text: "Pending",
      colorInverse: "default",
      color: "default",
   },
   [FixRequestStatus.APPROVED]: {
      text: "Approved",
      colorInverse: "green-inverse",
      color: "green",
   },
   [FixRequestStatus.REJECTED]: {
      text: "Rejected",
      colorInverse: "red-inverse",
      color: "red",
   },
   undefined: {
      text: "-",
      colorInverse: "default",
      color: "default",
   },
}
