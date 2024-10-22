import { LiteralUnion } from "antd/es/_util/type"
import { PresetColorType, PresetStatusColorType } from "antd/es/_util/colors"
import { ReactNode } from "react"

export type DtoStatus<T, S, O> = {
   name: T
   description: string
   index: number
   text: string
   color: LiteralUnion<PresetColorType | PresetStatusColorType>
   colorInverse: LiteralUnion<PresetColorType | PresetStatusColorType>
   conditionFn: (dto: O) => boolean
   icon: ReactNode
   statusEnum: S
   className?: string
}
