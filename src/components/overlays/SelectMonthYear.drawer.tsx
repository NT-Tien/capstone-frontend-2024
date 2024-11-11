"use client"

import Picker, { PickerValue } from "@/components/bundles/Picker"
import { cn } from "@/lib/utils/cn.util"
import { Button, Drawer, DrawerProps, Dropdown } from "antd"
import dayjs from "dayjs"
import { useCallback, useMemo, useState } from "react"
import { MoreOutlined, SelectOutlined } from "@ant-design/icons"
import { CalendarDot } from "@phosphor-icons/react"

type SelectMonthYearDrawerProps = {
   minDate?: Date
   maxDate?: Date
   defaultDate?: Date
   onSubmit?: (month: number, year: number) => void
}
type Props = Omit<DrawerProps, "children"> &
   SelectMonthYearDrawerProps & {
      handleClose?: () => void
   }

function SelectMonthYearDrawer(props: Props) {
   const defaultDate = props.defaultDate ? dayjs(props.defaultDate) : dayjs()
   const [pickerValue, setPickerValue] = useState<PickerValue>({
      month: defaultDate.format("MM"),
      year: defaultDate.format("YYYY"),
   })
   const minDate = useMemo(
      () => (props.minDate ? dayjs(props.minDate) : dayjs().subtract(10, "years")),
      [props.minDate],
   )
   const maxDate = useMemo(() => (props.maxDate ? dayjs(props.maxDate) : dayjs().add(10, "years")), [props.maxDate])

   const [months, setMonths] = useState<string[]>(() => {
      if (pickerValue.year === minDate.year().toString()) {
         const minMonth = minDate.month() + 1
         const remainingMonths = 12 - minMonth + 1
         return Array.from({ length: remainingMonths }, (_, i) => String(i + minMonth).padStart(2, "0"))
      } else if (pickerValue.year === maxDate.year().toString()) {
         const maxMonth = maxDate.month() + 1
         return Array.from({ length: maxMonth }, (_, i) => String(i + 1).padStart(2, "0"))
      } else {
         return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
      }
   })

   const handleDateChange = useCallback(
      (value: PickerValue, key: string) => {
         if (key === "month" || key === 'all') {
            setPickerValue((prev) => ({ ...prev, month: value.month }))
         }

         if (key === "year" || key === "all") {
            // if selected year is same as min year, update the months array
            if (value.year === minDate.year().toString()) {
               const minMonth = minDate.month() + 1 // 11
               const remainingMonths = 12 - minMonth + 1 // get the remaining months in the year
               setMonths(Array.from({ length: remainingMonths }, (_, i) => String(i + minMonth).padStart(2, "0")))
               setPickerValue((prev) => ({ ...prev, month: String(minDate.month() + 1).padStart(2, "0") }))
            } else if (value.year === maxDate.year().toString()) {
               const maxMonth = maxDate.month() + 1
               setMonths(Array.from({ length: maxMonth }, (_, i) => String(i + 1).padStart(2, "0")))
               setPickerValue((prev) => ({ ...prev, month: String(maxDate.month() + 1).padStart(2, "0") }))
            } else {
               setMonths(Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")))
            }

            setPickerValue((prev) => ({ ...prev, year: value.year }))
         }
      },
      [maxDate, minDate],
   )

   function handleSubmit() {
      if (!props.onSubmit) return

      props.handleClose?.()
      props.onSubmit(Number(pickerValue.month), Number(pickerValue.year))
   }

   return (
      <Drawer
         title={false}
         closeIcon={false}
         placement="bottom"
         height="max-content"
         classNames={{
            body: "p-0",
         }}
         {...props}
      >
         <header className="my-3 flex flex-col items-center justify-center px-layout">
            <div className="h-2 w-1/4 rounded-full bg-neutral-300" onClick={props.onClose} />
            <h1 className="mt-3 text-center text-lg font-semibold">Chọn tháng, năm</h1>
            <p className="font-base text-sm text-neutral-500 text-center">Vui lòng chọn tháng năm trong danh sách sau</p>
         </header>
         <Picker onChange={handleDateChange} value={pickerValue} wheelMode="normal">
            <Picker.Column name={"month"}>
               {months.map((month) => (
                  <Picker.Item key={month} value={month}>
                     {({ selected }) => (
                        <div className={cn(selected ? "font-semibold text-neutral-900" : "text-neutral-400")}>
                           Tháng {month}
                        </div>
                     )}
                  </Picker.Item>
               ))}
            </Picker.Column>
            <Picker.Column name="year">
               {Array.from({ length: maxDate.year() - minDate.year() + 1 }).map((_, i) => (
                  <Picker.Item key={i} value={String(minDate.year() + i)}>
                     {({ selected }) => (
                        <div className={cn(selected ? "font-semibold text-neutral-900" : "text-neutral-400")}>
                           {minDate.year() + i}
                        </div>
                     )}
                  </Picker.Item>
               ))}
            </Picker.Column>
         </Picker>
         <footer className="flex items-center gap-3 p-layout mt-3">
            <Button icon={<SelectOutlined />} block type="primary" onClick={handleSubmit}>
               Chọn
            </Button>
            <Dropdown
               menu={{
                  items: [
                     {
                        key: "today",
                        label: "Hôm nay",
                        icon: <CalendarDot size={18} weight='duotone' />,
                        onClick: () => {
                           handleDateChange({ month: dayjs().format("MM"), year: dayjs().format("YYYY") }, "all")
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

export default SelectMonthYearDrawer
export type { SelectMonthYearDrawerProps }
