import { ReactNode } from "react"
import { cn } from "@/common/util/cn.util"

export default function BottomBar({ children, className }: { children: ReactNode; className?: string }) {
   return <div className={cn("fixed bottom-0 left-0 w-full bg-[#F3EDF7] p-4", className)}>{children}</div>
}
