import { CSSProperties, ReactNode } from "react"
import { cn } from "@/common/util/cn.util"
import { Button, Card, Divider, Empty, Result, Skeleton, Space, Tooltip } from "antd"
import { InfoCircleFilled, InfoOutlined, ReloadOutlined } from "@ant-design/icons"

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
      <ul
         className={cn("grid grid-cols-1", props.className)}
         style={{
            ...props.style,
            border: props.bordered ? "1px solid #ddd" : undefined,
            borderRadius: "5%",
            boxShadow: props.bordered ? "0 2px 8px rgba(0, 0, 0, 0.1)" : undefined,
         }}
      >
         {props.items.map((item, index) => (
            <li
               key={index}
               className={cn("flex items-start justify-between px-layout py-3", props.itemClassName)}
               style={props.style}
            >
               {props.dataSource ? (
                  <>
              {item.isDivider && <Divider style={dividerStyle} />} 
              <div
                        className={cn(
                           "flex flex-grow items-center gap-2 text-base font-semibold",
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
                     <div className="flex-shrink-0">
                        <span className={cn("text-base", props.valueClassName)} style={props.valueStyle}>
                           {item.value(props.dataSource as NonNullable<T>)}
                        </span>
                     </div>
                  </>
               ) : (
                  <div className="col-span-2 grid grid-cols-2 gap-2">
                     <Skeleton.Button active className="col-span-1 w-full"></Skeleton.Button>
                     <Skeleton.Input active className="col-span-1 w-full"></Skeleton.Input>
                  </div>
               )}
            </li>
         ))}
      </ul>
   )
}
