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
      className: string
   }
} = {
   [FixType.REPLACE]: {
      text: "Thay thế",
      colorInverse: "geekblue-inverse",
      color: "geekblue",
      icon: <ReloadOutlined />,
      className: "text-blue-400",
   },
   [FixType.REPAIR]: {
      text: "Sửa chữa",
      colorInverse: "gold-inverse",
      color: "gold",
      icon: <SettingOutlined />,
      className: "text-yellow-400",
   },
   undefined: {
      text: "-",
      colorInverse: "default",
      color: "default",
      icon: <DashOutlined />,
      className: "text-gray-400",
   },
}
