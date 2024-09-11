import { cn } from "@/common/util/cn.util"
import { Warning } from "@phosphor-icons/react"
import { cva, VariantProps } from "class-variance-authority"

const styles = cva("border-l-4 p-4", {
   variants: {
      type: {
         warning: ["border-yellow-400 bg-yellow-50 text-yellow-700"],
         info: ["border-blue-400 bg-blue-50 text-blue-700"],
         error: ["border-red-400 bg-red-50 text-red-700"],
      },
   },
   defaultVariants: {
      type: "warning",
   },
})

type Props = {
   text: string
   icon?: React.ReactNode
   className?: string
   textClassName?: string
} & VariantProps<typeof styles>

function AlertCard(props: Props) {
   return (
      <div className={cn(styles({ type: props.type }), props.className)}>
         <div className="flex">
            <div className="flex-shrink-0">
               {props.icon ? (
                  props.icon
               ) : (
                  <Warning
                     size={20}
                     weight="fill"
                     aria-hidden="true"
                  />
               )}
            </div>
            <div className="ml-3">
               <p className={cn(props.textClassName)}>{props.text}</p>
            </div>
         </div>
      </div>
   )
}

export default AlertCard
