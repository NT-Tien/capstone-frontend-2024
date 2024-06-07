"use client"

import { cloneElement, ReactElement } from "react"
import { Badge } from "antd"

type NavbarMenuItem = {
   key: string
   name: string
   icon: ReactElement
   onClick?: () => void
   countBadge?: number
}

type MobileNavbarProps = {
   items: NavbarMenuItem[]
   currentActive?: string
}

export default function MobileNavbar(props: MobileNavbarProps) {
   return (
      <div className="fixed bottom-0 left-0 flex h-24 w-full justify-evenly bg-[#F3EDF7] pb-2">
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

type NavbarItemProps = {
   name: string
   icon: ReactElement
   onClick?: () => void
   countBadge?: number
   active?: boolean
}

function NavbarItem({ name, icon, active = false, countBadge = 0, onClick }: NavbarItemProps) {
   const displayIcon = cloneElement(icon, {
      style: {
         fontSize: "1.07rem",
         color: "#49454F",
      },
   })

   return (
      <div
         className="flex aspect-square h-full flex-col items-center justify-center gap-[2px] px-2"
         style={{
            cursor: onClick ? "pointer" : "default",
         }}
         onClick={onClick}
      >
         <div
            className="relative grid w-full place-items-center rounded-full py-[6px] transition-all"
            style={{
               backgroundColor: active ? "#E8DEF8" : "transparent",
            }}
         >
            <Badge count={countBadge} size="small">
               {displayIcon}
            </Badge>
         </div>
         <span className="text-[13px] font-semibold text-[#49454F]">{name}</span>
      </div>
   )
}