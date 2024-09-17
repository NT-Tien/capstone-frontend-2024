import dayjs from "dayjs"


function Page() {
   return (
      <div>
         {dayjs().format("YYYY-MM-DD HH:mm:ss")}
      </div>
   )
}

export default Page
