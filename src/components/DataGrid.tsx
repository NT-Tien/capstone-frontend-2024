import { ReactNode, useMemo } from "react"
import { Divider, Space } from "antd"
import { cn } from "@/lib/utils/cn.util"

type Item = {
   value: ReactNode
   icon: ReactNode
   hidden?: boolean
   className?: string
}
type Props = {
   items: Item[]
   cols: number
   className?: string
   classNames?: {
      item: string
   }
}

function DataGrid(props: Props) {
   const no_rows = useMemo(() => Math.ceil(props.items.length / props.cols), [props.cols, props.items.length])

   const item_rows = useMemo(() => {
      let returnValue = []
      const filteredItems = props.items.filter((i) => i.hidden !== true)
      for (let i = 0; i < no_rows; i++) {
         const content = filteredItems.slice(i * props.cols, i * props.cols + props.cols)
         for (let j = 0; j < props.cols - content.length && content.length < props.cols; j++) {
            content.push({
               value: null,
               icon: null,
            })
         }
         returnValue.push(content)
      }
      return returnValue
   }, [no_rows, props.cols, props.items])

   return (
      <div className={cn("bg-head_maintenance flex flex-col gap-2", props.className)}>
         {new Array(no_rows).fill(null).map((_, row) => (
            <Space
               key={`row_${row}`}
               split={<Divider type="vertical" className="m-0" />}
               className="w-full"
               classNames={{
                  item: "w-full",
               }}
            >
               {item_rows[row].map((item, col) => (
                  <div
                     key={`col_${col}`}
                     className={cn("flex items-center gap-1", props.classNames?.item, item.className)}
                  >
                     {item.icon}
                     {item.value}
                  </div>
               ))}
            </Space>
         ))}
      </div>
   )
}

export default DataGrid
