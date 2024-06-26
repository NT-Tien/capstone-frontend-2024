import { Tag } from "antd"
import { PresetColorType } from "antd/es/_util/colors"
import { LiteralUnion } from "antd/es/_util/type"

export enum IssueRequestStatus {
   PENDING = "PENDING",
   APPROVED = "APPROVED",
   REJECTED = "REJECTED",
}

export function IssueRequestStatusTag({ status }: { status: IssueRequestStatus }) {
   const colorMap: {
      [key in IssueRequestStatus]: LiteralUnion<
         PresetColorType | "success" | "processing" | "error" | "default" | "warning"
      >
   } = {
      PENDING: "default",
      APPROVED: "green",
      REJECTED: "red",
   }

   return <Tag color={colorMap[status]}>{status}</Tag>
}
