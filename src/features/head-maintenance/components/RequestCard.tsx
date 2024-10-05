import { ReactNode } from "react"
import generateAvatarData from "@/lib/utils/generateAvatarData.util"
import { cn } from "@/lib/utils/cn.util"
import { Avatar } from "antd"

function RequestCard() {
   return <div>Default Request Card</div>
}

type RequestCard_Large = {
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

RequestCard.Large = function RequestCardLarge(props: RequestCard_Large) {
   const avatarData = generateAvatarData(props.title)

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
               {/* <Button type="text" size="small" icon={<MoreOutlined />} className="m-0 p-0" /> */}
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

export default RequestCard
