import { Avatar, Button } from "antd"
import { MoreOutlined } from "@ant-design/icons"
import { ReactNode, useMemo } from "react"
import { cn } from "@/common/util/cn.util"

type Props = {
   title: string
   subtitle: ReactNode
   description: ReactNode
   footerLeft: ReactNode
   footerRight: ReactNode
   tag?: ReactNode
   className?: string
   headerClassName?: string
   footerClassName?: string
   onClick?: () => void
}

function RequestCard(props: Props) {
   const avatarData = useMemo(() => generateAvatarData(props.title), [props.title])

   return (
      <div
         className={cn(
            "flex flex-col",
            props.onClick && "cursor-pointer rounded-lg transition-all hover:bg-primary-50",
            props.className,
         )}
         onClick={props.onClick}
      >
         <div className={cn("flex gap-3", props.headerClassName)}>
            <Avatar size={48} className={cn(avatarData.color)}>
               {avatarData.content}
            </Avatar>
            <div className="flex flex-grow flex-col">
               <div className="text-lg font-medium">{props.title}</div>
               <div className="text-neutral-500">{props.subtitle}</div>
            </div>
            <div className="flex items-center gap-1">
               {props.tag && <div>{props.tag}</div>}
               <Button type="text" size="small" icon={<MoreOutlined />} className="m-0 p-0" />
            </div>
         </div>
         <div className="mt-2 line-clamp-1 text-neutral-400">{props.description}</div>
         <div className={cn("flex", props.footerClassName)}>
            <div className="flex-grow text-sm">{props.footerLeft}</div>
            <div className="text-sm">{props.footerRight}</div>
         </div>
      </div>
   )
}

const colors = [
   "bg-blue-500",
   "bg-green-500",
   "bg-yellow-500",
   "bg-red-500",
   "bg-purple-500",
   "bg-pink-500",
   "bg-indigo-500",
   "bg-cyan-500",
]

function generateAvatarData(input: string) {
   let content
   const splitInput = input.split(" ")
   if (splitInput.length > 1) {
      content = splitInput[0][0] + splitInput[1][0]
   } else {
      content = splitInput[0][0] + (splitInput[0][1] ? splitInput[0][1] : "")
   }
   const color =
      colors[
         content
            .split("")
            .map((char) => char.charCodeAt(0))
            .reduce((acc, cur) => acc + cur, 0) % colors.length
      ]

   return {
      content,
      color
   }
}

export default RequestCard
