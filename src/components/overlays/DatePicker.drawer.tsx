"use client"

import Picker, { PickerValue } from "@/components/bundles/Picker"
import { CalendarDot } from "@phosphor-icons/react"
import { Button, Drawer, Dropdown, DrawerProps } from "antd"
import dayjs, { Dayjs } from "dayjs"
import { useCallback, useEffect, useMemo, useState } from "react"
import { MoreOutlined, SelectOutlined } from "@ant-design/icons"

type DatePickerDrawerProps = {
   value?: Dayjs
   bounds?: {
      max: Dayjs
      min: Dayjs
   }
   onSubmit?: (date: Dayjs) => void
   title?: string
   subtitle?: string
}
type Props = Omit<DrawerProps, "children"> &
   DatePickerDrawerProps & {
      handleClose?: () => void
   }

function DatePickerDrawer(props: Props) {
   const [pickerValue, setPickerValue] = useState<PickerValue>({
      day: (props.value ?? dayjs()).format("DD"),
      month: (props.value ?? dayjs()).format("MM"),
      year: (props.value ?? dayjs()).format("YYYY"),
   })

   const [days, setDays] = useState<string[]>(() => {
      return getDayArray(pickerValue.month as string, pickerValue.year as string, props.bounds)
   })
   const [months, setMonths] = useState<string[]>(() => getMonthArray(pickerValue.year as string, props.bounds))
   const years = useMemo(() => getYearArray(props.bounds), [props.bounds])

   const handleChangePickerValue = useCallback(
      (value: PickerValue, key: string) => {
         if (key === "day" || key === "all") {
            setPickerValue(value)
         }

         if (key === "month" || key === "all") {
            const { year, month } = value
            const newDayArray = getDayArray(month as string, year as string, props.bounds)
            setDays(newDayArray)
            const newDay = newDayArray.includes(value.day as string) ? value.day : newDayArray[0]
            setPickerValue({ ...value, day: newDay })
         }

         if (key === "year" || key === "all") {
            const { year, month } = value

            // on year change, update the months array and set the month to the last month
            const newMonthArray = getMonthArray(year as string, props.bounds)
            setMonths(newMonthArray)

            const newMonth = newMonthArray.includes(month as string) ? month : newMonthArray[0]

            const newDayArray = getDayArray(newMonth as string, year as string, props.bounds)
            setDays(newDayArray)
            const newDay = newDayArray.includes(value.day as string) ? value.day : newDayArray[0]

            setPickerValue({ ...value, day: newDay, month: newMonth })
         }
      },
      [props.bounds],
   )

   function handleSubmit(pickerValue: PickerValue) {
      const { day, month, year } = pickerValue
      const newDate = dayjs()
         .set("date", Number(day))
         .set("month", Number(month) - 1)
         .set("year", Number(year))

      props.onSubmit?.(newDate)
      props.handleClose?.()
   }

   useEffect(() => {
      setDays(getDayArray(pickerValue.month as string, pickerValue.year as string, props.bounds))
      setMonths(getMonthArray(pickerValue.year as string, props.bounds))
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props.bounds])

   return (
      <Drawer
         closeIcon={false}
         placement="bottom"
         height="max-content"
         classNames={{
            body: "p-0",
         }}
         {...props}
         title={false}
      >
         <header className="my-3 flex flex-col items-center justify-center px-layout">
            <div className="h-2 w-1/4 rounded-full bg-neutral-300" onClick={props.onClose} />
            <h1 className="mt-3 text-center text-lg font-semibold">{props.title ?? "Chọn ngày, tháng, năm"}</h1>
            <p className="text-center font-base text-sm text-neutral-500">
               {props.subtitle ?? "Vui lòng chọn ngày, tháng, năm trong danh sách sau"}
            </p>
         </header>
         <Picker value={pickerValue} onChange={handleChangePickerValue}>
            <Picker.Column name="day">
               {days.map((day) => (
                  <Picker.Item key={day} value={day}>
                     {({ selected }) => (
                        <div className={selected ? "font-semibold text-neutral-900" : "text-neutral-400"}>{day}</div>
                     )}
                  </Picker.Item>
               ))}
            </Picker.Column>
            <Picker.Column name="month">
               {months.map((month) => (
                  <Picker.Item key={month} value={month}>
                     {({ selected }) => (
                        <div className={selected ? "font-semibold text-neutral-900" : "text-neutral-400"}>{month}</div>
                     )}
                  </Picker.Item>
               ))}
            </Picker.Column>
            <Picker.Column name="year">
               {years.map((year) => (
                  <Picker.Item key={year} value={year}>
                     {({ selected }) => (
                        <div className={selected ? "font-semibold text-neutral-900" : "text-neutral-400"}>{year}</div>
                     )}
                  </Picker.Item>
               ))}
            </Picker.Column>
         </Picker>
         <footer className="mt-3 flex items-center gap-3 p-layout">
            <Button icon={<SelectOutlined />} block type="primary" onClick={() => handleSubmit(pickerValue)}>
               Chọn
            </Button>
            <Dropdown
               menu={{
                  items: [
                     {
                        key: "today",
                        label: "Hôm nay",
                        icon: <CalendarDot size={18} weight="duotone" />,
                        onClick: () => {
                           handleChangePickerValue(
                              {
                                 day: dayjs().format("DD"),
                                 month: dayjs().format("MM"),
                                 year: dayjs().format("YYYY"),
                              },
                              "all",
                           )
                        },
                     },
                  ],
               }}
            >
               <Button icon={<MoreOutlined />} type="default" className="aspect-square" />
            </Dropdown>
         </footer>
      </Drawer>
   )
}

function getDayArray(month: string, year: string, bounds?: { min: Dayjs; max: Dayjs }) {
   if (bounds) {
      if (Number(year) === bounds.min.year() && Number(month) === bounds.min.month() + 1) {
         const minDay = bounds.min.date()
         const totalDays =
            dayjs()
               .set("year", Number(year))
               .set("month", Number(month) - 1)
               .daysInMonth() -
            minDay +
            1

         return Array.from({ length: totalDays }, (_, i) => String(i + minDay).padStart(2, "0"))
      } else if (Number(year) === bounds.max.year() && Number(month) === bounds.max.month() + 1) {
         const maxDay = bounds.max.date()
         return Array.from({ length: maxDay }, (_, i) => String(i + 1).padStart(2, "0"))
      }
   }

   const dayCount = dayjs()
      .set("year", Number(year))
      .set("month", Number(month) - 1)
      .daysInMonth()
   return Array.from({ length: dayCount }, (_, i) => String(i + 1).padStart(2, "0"))
}

function getMonthArray(year: string, bounds?: { min: Dayjs; max: Dayjs }) {
   if (bounds) {
      if (Number(year) === bounds.min.year()) {
         const minMonth = bounds?.min.month() + 1
         const remainingMonths = 12 - minMonth + 1
         return Array.from({ length: remainingMonths }, (_, i) => String(i + minMonth).padStart(2, "0"))
      } else if (Number(year) === bounds.max.year()) {
         const maxMonth = bounds?.max.month() + 1
         return Array.from({ length: maxMonth }, (_, i) => String(i + 1).padStart(2, "0"))
      }
   }

   return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
}

function getYearArray(bounds?: { min: Dayjs; max: Dayjs }) {
   if (bounds) {
      const { min, max } = bounds
      return Array.from({ length: max.year() - min.year() + 1 }, (_, i) => String(min.year() + i))
   } else {
      const min = dayjs().subtract(10, "years")
      const max = dayjs().add(10, "years")
      return Array.from({ length: max.year() - min.year() + 1 }, (_, i) => String(min.year() + i))
   }
}

export default DatePickerDrawer
export type { DatePickerDrawerProps }
