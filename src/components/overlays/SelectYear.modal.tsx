"use client"

import { Button, Drawer, DrawerProps, Flex, Modal, ModalProps } from "antd"
import { CalendarOutlined, CloseOutlined, MoreOutlined } from "@ant-design/icons"
import { JSX } from "react/jsx-runtime"
import IntrinsicElements = JSX.IntrinsicElements
import dayjs from "dayjs"
import { useEffect, useMemo, useRef } from "react"
import ClickableArea from "@/components/ClickableArea"
import { cn } from "@/lib/utils/cn.util"

type SelectYearModalProps = {
   currentYear?: number
   onSubmit?: (year: number) => void
}
type Props = Omit<ModalProps, "children"> &
   SelectYearModalProps & {
      handleClose?: () => void
   }

function SelectYearModal(props: Props) {
   const [minYear, maxYear] = useMemo(() => {
      const currentDate = dayjs().year()
      const minYear = currentDate - 100
      const maxYear = currentDate + 100

      return [minYear, maxYear]
   }, [])

   const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
   const containerRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const itemRefsValue = itemRefs.current
      const containerRefValue = containerRef.current
      if (props.currentYear && itemRefsValue && containerRefValue) {
         const currentItemRef = itemRefsValue[props.currentYear - minYear]

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
   }, [minYear, props.currentYear])

   return (
      <Modal
         title={
            <div className={"flex items-center justify-between"}>
               <Button type={"text"} icon={<CalendarOutlined />} />
               <h1>Chọn năm</h1>
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
            {new Array(maxYear - minYear).fill(null).map((_, index) => (
               <ClickableArea
                  type={"text"}
                  key={index + "_year"}
                  ref={(el) => {
                     itemRefs.current[index] = el
                  }}
                  className={cn(
                     "text-lg",
                     props.currentYear && index === props.currentYear - minYear && "bg-yellow-500",
                  )}
                  onClick={() => {
                     props.handleClose?.()
                     props.onSubmit?.(minYear + index)
                  }}
               >
                  {index + minYear}
               </ClickableArea>
            ))}
         </div>
      </Modal>
   )
}

export default SelectYearModal
export type { SelectYearModalProps }
