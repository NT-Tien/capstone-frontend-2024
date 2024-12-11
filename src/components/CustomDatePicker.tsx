"use client"

import DatePickerDrawer, { DatePickerDrawerProps } from "@/components/overlays/DatePicker.drawer"
import { CalendarOutlined, CloseCircleFilled } from "@ant-design/icons"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { Button, Input, Space } from "antd"
import { Dayjs } from "dayjs"
import { useEffect, useRef, useState } from "react"
import { capitalizeFirstLetter } from "@/lib/utils/capitalizeFirstLetter.util"
import ClickableArea from "@/components/ClickableArea"
import { cn } from "@/lib/utils/cn.util"

type Props = {
   value?: Dayjs
   onChange?: (value?: Dayjs) => void
   bounds?: {
      max: Dayjs
      min: Dayjs
   }
   className?: string
}

function CustomDatePicker(props: Props) {
   const [currentDate, setCurrentDate] = useState<Dayjs | undefined>(props.value)
   const control_datePickerDrawer = useRef<RefType<DatePickerDrawerProps>>(null)

   function handleOpenDatePicker() {
      control_datePickerDrawer.current?.handleOpen({
         bounds: props.bounds,
         value: currentDate,
      })
   }

   useEffect(() => {
      setCurrentDate(props.value)
   }, [props.value])

   return (
      <>
         <div className="flex h-10 items-center">
            <ClickableArea
               onClick={handleOpenDatePicker}
               className={cn("h-full w-full justify-start rounded-l-lg p-0 rounded-r-none", !currentDate && "rounded-r-lg")}
            >
               <div className="grid h-full place-items-center rounded-l-lg border-r-[1px] border-r-neutral-200 bg-neutral-100 px-3">
                  <CalendarOutlined />
               </div>
               <div className="mr-auto text-base">
                  {currentDate ? capitalizeFirstLetter(currentDate.format("DD/MM/YYYY")) : <span className='text-neutral-300'>Chọn ngày, tháng, năm</span>}
               </div>
            </ClickableArea>
            {currentDate && (
               <ClickableArea
                  onClick={() => {
                     setCurrentDate(undefined)
                     props.onChange?.(undefined)
                  }}
                  
                  className="h-full rounded-l-none p-3"
                  icon={<CloseCircleFilled className='text-sm' />}
               />
            )}
         </div>
         <OverlayControllerWithRef ref={control_datePickerDrawer}>
            <DatePickerDrawer
               onSubmit={(date) => {
                  setCurrentDate(date)
                  props.onChange?.(date)
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default CustomDatePicker
