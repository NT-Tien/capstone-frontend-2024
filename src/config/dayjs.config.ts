import relativeTime from "dayjs/plugin/relativeTime"
import timezone from "dayjs/plugin/timezone"
import "dayjs/locale/vi"
import dayjs from "dayjs"

const extended_dayjs = dayjs

extended_dayjs.extend(relativeTime)
extended_dayjs.extend(timezone)

extended_dayjs.tz.setDefault("Asia/Ho_Chi_Minh")

extended_dayjs.locale("vi")

export default extended_dayjs
