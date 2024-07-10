import { Tag, TagProps } from "antd"
import { PresetColorType } from "antd/es/_util/colors"
import { LiteralUnion } from "antd/es/_util/type"

export enum IssueRequestStatus {
   PENDING = "PENDING",
   APPROVED = "APPROVED",
   REJECTED = "REJECTED",
}

export function IssueRequestStatusTag({ status, ...props }: { status?: IssueRequestStatus } & TagProps) {
   const colorMap: {
      [key in IssueRequestStatus]: LiteralUnion<
         PresetColorType | "success" | "processing" | "error" | "default" | "warning"
      >
   } = {
      PENDING: "default",
      APPROVED: "green",
      REJECTED: "red",
   }

   return (
      <Tag color={status ? colorMap[status] : "default"} {...props}>
         {status}
      </Tag>
   )
}
