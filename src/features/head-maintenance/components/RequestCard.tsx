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
         <div className={cn("grid grid-cols-[50px_1fr_85px] gap-3", props.headerClassName)}>
            <Avatar size={48} className={cn(avatarData.color)}>
               {avatarData.content}
            </Avatar>
            <div className="flex flex-col">
               <div className="flex items-center justify-between">
                  <div className="text-lg font-medium">{props.title}</div>
                  <span className="text-left text-xs text-neutral-500">{props.footerRight}</span>{" "}
                  {/* Moved getCreatedAt here */}
               </div>{" "}
               <div className="text-neutral-500">{props.subtitle}</div>
            </div>
            <div className="">
               {props.tag && <div>{props.tag}</div>}
               {/* <Button type="text" size="small" icon={<MoreOutlined />} className="m-0 p-0" /> */}
            </div>
         </div>
         <div className="mt-2 line-clamp-1 text-neutral-400">{props.description}</div>
         <div className={cn("flex", props.footerClassName)}>
            <div className="flex-grow text-sm">{props.footerLeft}</div>
         </div>
      </div>
   )
}

export default RequestCard
