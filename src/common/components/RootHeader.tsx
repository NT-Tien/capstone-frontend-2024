"use client"

import { Button, ButtonProps } from "antd"
import { ContainerFilled } from "@ant-design/icons"
import { CSSProperties, useEffect } from "react"
import { cn } from "@/common/util/cn.util"
import LocaleSwitcher from "@/common/components/LocaleSwitcher"
import ModalConfirm, { type Props as ModalConfirmProps } from "@/common/components/ModalConfirm"

type Props = {
   title: string
   icon?: JSX.Element
   onIconClick?: () => void
   confirmOnIconClick?: boolean
   confirmModalProps?: Omit<ModalConfirmProps, "onConfirm" | "children">
   style?: CSSProperties
   buttonProps?: Omit<ButtonProps, "onClick">
   className?: string
}

export default function RootHeader({
   title,
   style,
   onIconClick,
   buttonProps,
   confirmOnIconClick = false,
   confirmModalProps,
   icon = <ContainerFilled className="text-lg" />,
   className,
}: Props) {
   useEffect(() => {
      function handleBeforeUnload(e: BeforeUnloadEvent) {
         e.preventDefault()
         e.stopPropagation()
      }

      if (confirmOnIconClick) {
         window.addEventListener("beforeunload", handleBeforeUnload)
      }

      return () => {
         if (confirmOnIconClick) {
            window.removeEventListener("beforeunload", handleBeforeUnload)
         }
      }
   }, [confirmOnIconClick])

   return (
      <div
         className={cn("flex h-min w-full items-center justify-between bg-white shadow-soft", className)}
         style={style}
      >
         <span className="flex flex-grow items-center gap-1 text-xl font-semibold">
            {confirmOnIconClick ? (
               <ModalConfirm onConfirm={onIconClick} {...confirmModalProps}>
                  <Button icon={icon} type="text" className="p-0" {...buttonProps} />
               </ModalConfirm>
            ) : (
               <Button icon={icon} type="text" className="p-0" onClick={onIconClick} {...buttonProps} />
            )}
            {title}
         </span>
         <div className="">
            <LocaleSwitcher />
         </div>
      </div>
   )
}
