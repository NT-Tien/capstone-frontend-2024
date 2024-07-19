import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/vi"
import dayjs from "dayjs"

dayjs.locale("vi")
dayjs.extend(relativeTime)

const extended_dayjs = dayjs

export default extended_dayjs
