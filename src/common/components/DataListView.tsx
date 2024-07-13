import { CSSProperties, ReactNode } from "react"
import { cn } from "@/common/util/cn.util"
import { Divider, Skeleton } from "antd"

export type ItemProp<T> = {
   label: ReactNode
   value: (src: NonNullable<T>) => ReactNode
}

type Props<T> = {
   dataSource: T
   items: ItemProp<T>[]
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
                  "grid grid-cols-2 p-1 py-2.5",
                  index !== props.items.length - 1 && "border-b-2",
                  props.itemClassName,
               )}
               style={props.style}
            >
               {props.dataSource ? (
                  <>
                     <span className={cn("font-semibold", props.labelClassName)} style={props.labelStyle}>
                        {item.label}
                     </span>
                     <span className={cn(props.valueClassName)} style={props.valueStyle}>
                        {item.value(props.dataSource as NonNullable<T>)}
                     </span>
                  </>
               ) : (
                  <Skeleton.Button className="w-full"></Skeleton.Button>
               )}
            </li>
         ))}
      </ul>
   )
}
