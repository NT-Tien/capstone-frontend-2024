import { cn } from "@/lib/utils/cn.util"
import { InfoCircleFilled } from "@ant-design/icons"
import { Divider, Skeleton, Tooltip } from "antd"
import { CSSProperties, ReactNode } from "react"

const dividerStyle: CSSProperties = {
   borderTop: "2px solid #ddd",
   margin: "0",
   marginBottom: "3px",
}
export type ItemProp<T> = {
   label: ReactNode
   value: (src: NonNullable<T>) => ReactNode
   tooltip?: string
   isDivider?: boolean
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
                  "flex items-start justify-between gap-3 px-layout py-3",
                  !props.dataSource && index === 0 && "pt-layout",
                  !props.dataSource && index === props.items.length - 1 && "pb-layout",
                  props.itemClassName,
               )}
               style={props.itemStyle}
            >
               {props.dataSource ? (
                  <>
                     {item.isDivider && <Divider style={dividerStyle} />}
                     <div
                        className={cn(
                           "flex flex-grow items-center gap-2 whitespace-nowrap text-base font-semibold",
                           props.labelClassName,
                        )}
                        style={props.labelStyle}
                     >
                        {item.label}
                        {item.tooltip && (
                           <Tooltip title={item.tooltip}>
                              <InfoCircleFilled />
                           </Tooltip>
                        )}
                     </div>
                     <div className="">
                        <span
                           className={cn("block whitespace-pre-wrap text-base", props.valueClassName)}
                           style={props.valueStyle}
                        >
                           {item.value(props.dataSource as NonNullable<T>)}
                        </span>
                     </div>
                  </>
               ) : (
                  <div className="col-span-2 grid w-full grid-cols-2 gap-2">
                     <Skeleton.Button active className="col-span-1 w-full"></Skeleton.Button>
                     <Skeleton.Input active className="col-span-1 w-full"></Skeleton.Input>
                  </div>
               )}
            </li>
         ))}
      </ul>
   )
}
