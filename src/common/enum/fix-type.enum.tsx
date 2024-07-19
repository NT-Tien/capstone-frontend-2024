import type { LiteralUnion } from "antd/es/_util/type"
import type { PresetColorType, PresetStatusColorType } from "antd/es/_util/colors"
import { ReactNode } from "react"
import { DashOutlined, ReloadOutlined, SettingOutlined } from "@ant-design/icons"

export enum FixType {
   REPLACE = "REPLACE",
   REPAIR = "REPAIR",
}

export const FixTypeTagMapper: {
   [key: string]: {
      text: string
      color: LiteralUnion<PresetColorType | PresetStatusColorType>
      colorInverse: LiteralUnion<PresetColorType | PresetStatusColorType>
      icon: ReactNode
   }
} = {
   [FixType.REPLACE]: {
      text: "Replace",
      colorInverse: "geekblue-inverse",
      color: "geekblue",
      icon: <ReloadOutlined />,
   },
   [FixType.REPAIR]: {
      text: "Repair",
      colorInverse: "gold-inverse",
      color: "gold",
      icon: <SettingOutlined />,
   },
   undefined: {
      text: "-",
      colorInverse: "default",
      color: "default",
      icon: <DashOutlined />,
   },
}
