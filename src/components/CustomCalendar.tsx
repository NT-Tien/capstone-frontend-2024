"use client"

import { vi } from "react-day-picker/locale"
import { Badge, Select } from "antd"
import { ChangeEvent, memo, useMemo } from "react"
import { Day, DayPicker, type DayPickerProps } from "react-day-picker"
import dynamic from "next/dynamic"
import dayjs, { Dayjs } from "dayjs"

type Props = {
   highlightedCounts?: {
      [date: string]: number
   }
   highlightedDots?: Set<string>
} & DayPickerProps

function CustomCalendar(props: Props) {
   return (
      <DayPicker
         mode={"single"}
         // timeZone={"+07:00"}
         locale={vi}
         weekStartsOn={1}
         captionLayout={"dropdown"}
         components={{
            Dropdown: (props) => {
               return (
                  <Select
                     variant={"borderless"}
                     value={props.value}
                     defaultValue={props.defaultValue}
                     onChange={(value, e) => props.onChange?.({ target: { value } } as ChangeEvent<HTMLSelectElement>)}
                     options={props.options}
                  />
               )
            },
            Day: (innerProps) => {
               const dateClone = dayjs(innerProps.day.date).format("DD/MM/YYYY")
               const isHighlightedCount = props.highlightedCounts?.[dateClone]
               const isHighlightedDot = props.highlightedDots?.has(dateClone)

               return (
                  <td className={innerProps.className + " "}>
                     <Badge
                        size={"small"}
                        classNames={{
                           indicator: "text-xs px-1",
                        }}
                        offset={[-5, 2]}
                        count={isHighlightedCount}
                     >
                        <Day {...innerProps} />
                     </Badge>
                     {isHighlightedDot && <div className={"mx-auto size-1 -translate-y-2 rounded-full bg-white"}></div>}
                  </td>
               )
            },
         }}
         {...props}
      />
   )
}

export default dynamic(() => Promise.resolve(memo(CustomCalendar)), { ssr: false })
