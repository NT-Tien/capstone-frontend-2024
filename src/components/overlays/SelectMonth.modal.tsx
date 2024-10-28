"use client"

import { Button, Drawer, DrawerProps, Flex, Modal, ModalProps } from "antd"
import { CalendarOutlined, CloseOutlined, MoreOutlined } from "@ant-design/icons"
import { JSX } from "react/jsx-runtime"
import IntrinsicElements = JSX.IntrinsicElements
import dayjs from "dayjs"
import { useEffect, useMemo, useRef } from "react"
import ClickableArea from "@/components/ClickableArea"
import { cn } from "@/lib/utils/cn.util"

type SelectMonthModalProps = {
   currentMonth?: number
   onSubmit?: (year: number) => void
}
type Props = Omit<ModalProps, "children"> &
   SelectMonthModalProps & {
      handleClose?: () => void
   }

function SelectMonthModal(props: Props) {
   const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
   const containerRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const itemRefsValue = itemRefs.current
      const containerRefValue = containerRef.current
      if (props.currentMonth && itemRefsValue && containerRefValue) {
         const currentItemRef = itemRefsValue[props.currentMonth]

         if (currentItemRef) {
            const containerHeight = containerRefValue.offsetHeight
            const itemOffsetTop = currentItemRef.offsetTop
            const itemHeight = currentItemRef.offsetHeight

            const scrollPosition = itemOffsetTop - containerHeight / 2 + itemHeight / 2
            containerRefValue.scrollTo({
               top: scrollPosition,
               behavior: "smooth",
            })
         }
      }
   }, [props.currentMonth])

   return (
      <Modal
         title={
            <div className={"flex items-center justify-between"}>
               <Button type={"text"} icon={<CalendarOutlined />} />
               <h1>Chọn tháng</h1>
               <Button type={"text"} icon={<CloseOutlined />} onClick={props.onClose} />
            </div>
         }
         width={"70%"}
         height={"70%"}
         closeIcon={false}
         footer={false}
         {...props}
      >
         <div className={"grid h-96 grid-cols-1 overflow-y-auto"} ref={containerRef}>
            {new Array(12).fill(null).map((_, index) => (
               <ClickableArea
                  type={"text"}
                  key={index + "_month"}
                  ref={(el) => {
                     itemRefs.current[index] = el
                  }}
                  className={cn("text-lg", props.currentMonth && index === props.currentMonth && "bg-yellow-500")}
                  onClick={() => {
                     props.handleClose?.()
                     props.onSubmit?.(index)
                  }}
               >
                  Tháng {index + 1}
               </ClickableArea>
            ))}
         </div>
      </Modal>
   )
}

export default SelectMonthModal
export type { SelectMonthModalProps }
