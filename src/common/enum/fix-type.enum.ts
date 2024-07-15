import type { LiteralUnion } from "antd/es/_util/type"
import type { PresetColorType, PresetStatusColorType } from "antd/es/_util/colors"

export enum FixType {
   REPLACE = "REPLACE",
   REPAIR = "REPAIR",
}

export const FixTypeTagMapper: {
   [key: string]: {
      text: string
      color: LiteralUnion<PresetColorType | PresetStatusColorType>
      colorInverse: LiteralUnion<PresetColorType | PresetStatusColorType>
   }
} = {
   [FixType.REPLACE]: {
      text: "Replace",
      colorInverse: "geekblue-inverse",
      color: "geekblue",
   },
   [FixType.REPAIR]: {
      text: "Repair",
      colorInverse: "gold-inverse",
      color: "gold",
   },
   undefined: {
      text: "-",
      colorInverse: "default",
      color: "default",
   },
}
