"use client"

import ModalConfirm, { type Props as ModalConfirmProps } from "@/old/ModalConfirm"
import { cn } from "@/lib/utils/cn.util"
import { ContainerFilled } from "@ant-design/icons"
import { Button, ButtonProps } from "antd"
import { CSSProperties, useEffect } from "react"

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

      // Prevent user from reloading or changing url manually
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
         <span className="flex flex-grow items-center justify-between gap-1 text-xl font-semibold">
            {confirmOnIconClick ? (
               <ModalConfirm onConfirm={onIconClick} {...confirmModalProps}>
                  <Button icon={icon} type="text" className="p-0" {...buttonProps} />
               </ModalConfirm>
            ) : (
               <Button icon={icon} type="text" className="p-0" onClick={onIconClick} {...buttonProps} />
            )}
            <div className="flex justify-center w-full">{title}</div>
         </span>
      </div>
   )
}
