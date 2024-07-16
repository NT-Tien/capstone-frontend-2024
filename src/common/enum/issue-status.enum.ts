import { LiteralUnion } from "antd/es/_util/type"
import { PresetColorType, type PresetStatusColorType } from "antd/es/_util/colors"

export enum IssueStatusEnum {
   PENDING = "PENDING",
   FAILED = "FAILED",
   RESOLVED = "RESOLVED",
}

export const IssueStatusEnumTagMapper: {
   [key: string]: {
      text: string
      color: LiteralUnion<PresetColorType | PresetStatusColorType>
      colorInverse: LiteralUnion<PresetColorType | PresetStatusColorType>
   }
} = {
   [IssueStatusEnum.PENDING]: {
      text: "Pending",
      color: "default",
      colorInverse: "default",
   },
   [IssueStatusEnum.FAILED]: {
      text: "Failed",
      color: "red",
      colorInverse: "red-inverse",
   },
   [IssueStatusEnum.RESOLVED]: {
      text: "Resolved",
      color: "green",
      colorInverse: "green-inverse",
   },
}
