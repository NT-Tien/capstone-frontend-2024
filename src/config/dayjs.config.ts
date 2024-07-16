import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/en"
import dayjs from "dayjs"

dayjs.locale("en")
dayjs.extend(relativeTime)

const extended_dayjs = dayjs

export default extended_dayjs
