import dayjs, { Dayjs } from "dayjs"

type Props = {
   date: Dayjs | string
   shortenedConditionFn?: (date: Dayjs) => boolean
   shortenedRenderFn?: (date: Dayjs) => React.ReactNode
   longRenderFn?: (date: Dayjs) => React.ReactNode
}

function DateViewSwitcher(props: Props) {
   const today = dayjs()
   const date = dayjs(props.date)

   if (props.shortenedConditionFn ? props.shortenedConditionFn(date) : date.isSame(today, "day")) {
      return props.shortenedRenderFn ? props.shortenedRenderFn(date) : date.locale("vi").fromNow()
   }

   return props.longRenderFn ? props.longRenderFn(date) : date.format("DD/MM/YYYY")
}

export default DateViewSwitcher
