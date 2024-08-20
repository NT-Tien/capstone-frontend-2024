import { CSSProperties, ReactNode } from "react"
import { cn } from "@/common/util/cn.util"
import { Button, Card, Divider, Empty, Result, Skeleton, Space, Tooltip } from "antd"
import { InfoCircleFilled, InfoOutlined, ReloadOutlined } from "@ant-design/icons"

export type ItemProp<T> = {
   label: ReactNode
   value: (src: NonNullable<T>) => ReactNode
   tooltip?: string
}

type Props<T> = {
   dataSource: T
   items: ItemProp<T>[]
   bordered?: boolean
   className?: string
   style?: CSSProperties
   itemClassName?: string
   itemStyle?: CSSProperties
   labelClassName?: string
   labelStyle?: CSSProperties
   valueClassName?: string
   valueStyle?: CSSProperties
}

export default function DataListView<T>(props: Props<T>) {
   return (
      <ul className={cn("grid grid-cols-1", props.className)} style={props.style}>
         {props.items.map((item, index) => (
            <li
               key={index}
               className={cn(
                  "grid grid-cols-2 items-start px-layout py-3",
                  props.bordered && index !== props.items.length - 1 && "border-b-2 border-b-neutral-200/70",
                  index % 2 !== 0 && "bg-neutral-50",
                  props.itemClassName,
               )}
               style={props.style}
            >
               {props.dataSource ? (
                  <>
                     <div
                        className={cn("flex items-center gap-2 text-base font-semibold", props.labelClassName)}
                        style={props.labelStyle}
                     >
                        {item.label}
                        {item.tooltip && (
                           <Tooltip title={item.tooltip}>
                              <InfoCircleFilled />
                           </Tooltip>
                        )}
                     </div>
                     <span className={cn("text-base", props.valueClassName)} style={props.valueStyle}>
                        {item.value(props.dataSource as NonNullable<T>)}
                     </span>
                  </>
               ) : (
                  <div className="col-span-2 grid gap-2 grid-cols-2">
                     <Skeleton.Button active className="col-span-1 w-full"></Skeleton.Button>
                     <Skeleton.Input active className="col-span-1 w-full"></Skeleton.Input>
                  </div>
               )}
            </li>
         ))}
      </ul>
   )
}
