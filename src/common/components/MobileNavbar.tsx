"use client"

import { cloneElement, ReactElement } from "react"
import { Badge } from "antd"
import { cn } from "@/common/util/cn.util"

export type NavbarMenuItem = {
   key: string
   name: string
   icon: ReactElement
   onClick?: () => void
   countBadge?: number
}

export type MobileNavbarProps = {
   items: NavbarMenuItem[]
   currentActive?: string
}

export default function MobileNavbar(props: MobileNavbarProps) {
   return (
      <div className="sticky bottom-0 left-0 flex h-[88px] w-full justify-between gap-2 border-t-2 border-t-slate-100 bg-white px-2 shadow-fb">
         {props.items.map((item) => (
            <NavbarItem
               key={item.key}
               name={item.name}
               icon={item.icon}
               countBadge={item.countBadge}
               active={item.key === props.currentActive}
               onClick={item.onClick}
            />
         ))}
      </div>
   )
}

export type NavbarItemProps = {
   name: string
   icon: ReactElement
   onClick?: () => void
   countBadge?: number
   active?: boolean
}

function NavbarItem({ name, icon, active = false, countBadge = 0, onClick }: NavbarItemProps) {
   const displayIcon = cloneElement(icon, {
      style: {
         fontSize: "18px",
         color: active ? "var(--primary-700)" : "#49454F",
         opacity: active ? 1 : 0.7,
      },
   })

   return (
      <div
         className="flex h-full w-full flex-col items-center justify-center gap-2 pb-5 pt-4"
         style={{
            cursor: onClick ? "pointer" : "default",
         }}
         onClick={onClick}
      >
         <div className="relative grid place-items-center">
            <div
               className={cn(
                  "absolute grid h-6 w-16 place-items-center self-center rounded-full px-5 py-1 text-center transition-all",
                  active ? "bg-primary-300" : "bg-transparent",
               )}
               style={{
                  transform: active ? "scale(1)" : "scale(0)",
                  transition: "transform 0.3s",
               }}
            ></div>
            <Badge count={countBadge} size="small">
               {displayIcon}
            </Badge>
         </div>
         <span
            className={cn(
               "text-[14px] font-[600] leading-[16px] tracking-[0.15px] text-[#49454F]",
               active === false && "opacity-70",
               active === true && "text-primary-500",
            )}
         >
            {name}
         </span>
      </div>
   )
}
