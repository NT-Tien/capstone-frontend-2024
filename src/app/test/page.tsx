"use client"

import CustomDatePicker from "@/components/CustomDatePicker"
import dayjs, { Dayjs } from "dayjs"
import React from "react"

function Page() {
   const [date, setDate] = React.useState<Dayjs | undefined>()

   return (
      <div className="p-layout">
         <CustomDatePicker
            value={date}
            onChange={setDate}
            bounds={{
               max: dayjs().add(2, "years").set("month", 4).set("day", 15),
               min: dayjs(),
            }}
         />
         <div>
            <h1>OUTSIDE DATE</h1>
            <div>{date ? date.format("DD/MM/YYYY") : "No date selected"}</div>
         </div>
      </div>
   )
}

export default Page
